import json
import os
from abc import ABC
from dataclasses import dataclass, field

from curl_helper import CurlDelete, CurlGet, CurlPost


@dataclass
class File(ABC):
    path: str
    status: str


@dataclass
class LocalFile(File):
    def __init__(self, path: str, status: str = "local_only"):
        super().__init__(path, status)


@dataclass
class RemoteFile(File):
    uuid: str

    def __init__(self, path: str, uuid: str, status: str = "remote_only"):
        super().__init__(path, status)
        self.uuid = uuid


@dataclass
class PartialMatch:
    local_file: LocalFile
    remote_file: RemoteFile


@dataclass
class Manifest:
    files: list[dict[str, str]]
    additional_local_directories: list[str]


@dataclass
class SyncState:
    local_files: list[LocalFile] = field(default_factory=list)
    remote_files: list[RemoteFile] = field(default_factory=list)
    partial_matches: list[PartialMatch] = field(default_factory=list)
    uuid_map: dict[str, str] = field(default_factory=dict)
    fetched: bool = False
    additional_local_directories: list[str] = field(default_factory=list)

    def get_only_local(self) -> list[LocalFile]:
        return [f for f in self.local_files if f.status == "local_only"]

    def get_only_remote(self) -> list[RemoteFile]:
        return [f for f in self.remote_files if f.status == "remote_only"]

    def find_partial_matches(self) -> None:
        self.partial_matches.clear()
        only_local = self.get_only_local()
        only_remote = self.get_only_remote()

        for local_file in only_local:
            local_filename = os.path.basename(local_file.path)
            for remote_file in only_remote:
                if remote_file.path.endswith(local_filename):
                    self.partial_matches.append(PartialMatch(local_file, remote_file))
                    local_file.status = "partial_match"
                    remote_file.status = "partial_match"
                    break

    def build_manifest(self) -> Manifest:
        files = [
            {"path": f.path, "status": f.status}
            for f in self.local_files + self.remote_files
        ]
        return Manifest(files, self.additional_local_directories)


class SyncManager:
    def __init__(self):
        self.state = SyncState()
        self.curl_get = CurlGet()

    def fetch_and_compare(self) -> None:
        local_files = get_local_files(".")
        self.fetch_remote_files(local_files)
        self.state.find_partial_matches()
        self.update_additional_directories()
        self.state.fetched = True

    def fetch_remote_files(self, local_files: set[str]) -> None:
        try:
            result = self.curl_get.perform_request()
            remote_files_data = json.loads(result)

            self.state.uuid_map = {
                file["file_name"]: file["uuid"] for file in remote_files_data
            }
            remote_files = set(self.state.uuid_map.keys())

            self.state.local_files = [LocalFile(path) for path in local_files]
            self.state.remote_files = [
                RemoteFile(path, self.state.uuid_map[path]) for path in remote_files
            ]

            # Update statuses for synced files
            for local_file in self.state.local_files:
                if local_file.path in remote_files:
                    local_file.status = "synced"
                    remote_file = next(
                        rf
                        for rf in self.state.remote_files
                        if rf.path == local_file.path
                    )
                    remote_file.status = "synced"

        except json.JSONDecodeError as e:
            raise ValueError(f"Error decoding JSON response: {e}")
        except KeyError as e:
            raise ValueError(f"Unexpected response format: {e}")

    def update_additional_directories(self) -> None:
        local_dirs = set(os.path.dirname(f.path) for f in self.state.local_files)
        remote_dirs = set(os.path.dirname(f.path) for f in self.state.remote_files)
        self.state.additional_local_directories = sorted(local_dirs - remote_dirs)

    def upload_file(self, file: LocalFile) -> None:
        try:
            with open(file.path, "r") as f:
                content = f.read()
            curl_post = CurlPost(file.path, content)
            result = curl_post.perform_request()
            print(f"Successfully uploaded: {file.path}")
            print(f"Response: {result}")
        except IOError as e:
            raise IOError(f"Error reading file {file.path}: {e}")
        except Exception as e:
            raise Exception(f"Error uploading file {file.path}: {e}")

    def delete_file(self, file: RemoteFile) -> None:
        try:
            curl_delete = CurlDelete(file.uuid)
            result = curl_delete.perform_request()
            print(f"Successfully deleted: {file.path}")
            print(f"Response: {result}")
        except Exception as e:
            raise Exception(f"Error deleting file {file.path}: {e}")

    def save_manifest(self) -> None:
        manifest = self.state.build_manifest()
        with open("manifest.json", "w") as f:
            json.dump(manifest.__dict__, f, indent=2)
        print("Manifest saved to manifest.json")


def get_local_files(directory: str) -> set[str]:
    local_files = set()
    for root, _, files in os.walk(directory):
        if "node_modules" in root or "build" in root:
            continue
        for file in files:
            if file.endswith((".js", ".ts", ".tsx", ".py")) or file == "manifest.json":
                rel_path = os.path.relpath(os.path.join(root, file), directory)
                local_files.add(rel_path)
    return local_files
