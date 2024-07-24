import json
import os
from abc import ABC
from dataclasses import dataclass, field

from curl_helper import CurlDelete, CurlGet, CurlPost
from manifest import Manifest


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
class SyncState:
    local_files: list[LocalFile] = field(default_factory=list)
    remote_files: list[RemoteFile] = field(default_factory=list)
    fetched: bool = False
    uuid_map: dict[str, str] = field(default_factory=dict)
    manifest: Manifest = field(default_factory=lambda: Manifest.load_from_file())

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


class SyncManager:
    def __init__(self):
        self.state = SyncState()
        self.curl_get = CurlGet()

    def apply_manifest_rules(self) -> None:
        for rule in self.state.manifest.rules:
            if rule["type"] == "directory_match":
                self.apply_directory_match_rule(rule["source"], rule["target"])

    def apply_directory_match_rule(self, source: str, target: str) -> None:
        for local_file in self.state.local_files:
            if local_file.path.startswith(f"{source}/"):
                remote_path = local_file.path.replace(f"{source}/", f"{target}/", 1)
                remote_file = next(
                    (rf for rf in self.state.remote_files if rf.path == remote_path),
                    None,
                )
                if remote_file:
                    local_file.status = "synced"
                    remote_file.status = "synced"
                else:
                    # Check if there's a corresponding file in the remote files without the "helloworld/" prefix
                    alternative_remote_path = local_file.path.replace(
                        f"{source}/", "", 1
                    )
                    alternative_remote_file = next(
                        (
                            rf
                            for rf in self.state.remote_files
                            if rf.path == alternative_remote_path
                        ),
                        None,
                    )
                    if alternative_remote_file:
                        local_file.status = "synced"
                        alternative_remote_file.status = "synced"

    def update_file_statuses(self) -> None:
        remote_paths = set(rf.path for rf in self.state.remote_files)

        for local_file in self.state.local_files:
            if local_file.status != "synced":
                if local_file.path in remote_paths:
                    local_file.status = "synced"
                else:
                    local_file.status = "local_only"

        for remote_file in self.state.remote_files:
            if remote_file.status != "synced":
                if any(lf.path == remote_file.path for lf in self.state.local_files):
                    remote_file.status = "synced"
                else:
                    remote_file.status = "remote_only"

    def fetch_and_compare(self) -> None:
        local_files = get_local_files(".")
        self.fetch_remote_files(local_files)
        self.apply_manifest_rules()
        self.update_file_statuses()
        self.state.fetched = True

    def save_manifest(self) -> None:
        manifest = self.state.manifest
        manifest.files = [
            {
                "path": f.path,
                "status": "local" if isinstance(f, LocalFile) else "remote",
            }
            for f in self.state.local_files + self.state.remote_files
        ]
        manifest.save_to_file()
        print("Manifest saved to manifest.json")

    def fetch_remote_files(self, local_files: set[str]) -> None:
        try:
            result = self.curl_get.perform_request()
            remote_files_data = json.loads(result)

            self.state.uuid_map = {
                file["file_name"]: file["uuid"] for file in remote_files_data
            }
            remote_files = set(self.state.uuid_map.keys())

            # Create LocalFile objects for all local files
            self.state.local_files = [LocalFile(path) for path in local_files]

            # Create RemoteFile objects for all remote files
            self.state.remote_files = [
                RemoteFile(path, self.state.uuid_map[path]) for path in remote_files
            ]

            # Update statuses for all files
            for local_file in self.state.local_files:
                if local_file.path in remote_files:
                    local_file.status = "synced"
                    remote_file = next(
                        rf
                        for rf in self.state.remote_files
                        if rf.path == local_file.path
                    )
                    remote_file.status = "synced"
                else:
                    local_file.status = "local_only"

            for remote_file in self.state.remote_files:
                if remote_file.path not in local_files:
                    remote_file.status = "remote_only"

        except json.JSONDecodeError as e:
            raise ValueError(f"Error decoding JSON response: {e}")
        except KeyError as e:
            raise ValueError(f"Unexpected response format: {e}")

    def upload_content(self, filename: str, content: str) -> None:
        try:
            curl_post = CurlPost(filename, content)
            result = curl_post.perform_request()
            print(f"Successfully uploaded {filename}")
            print(f"Response: {result}")
        except Exception as e:
            raise Exception(f"Error uploading {filename}: {e}")

    def upload_file(self, file: LocalFile) -> None:
        filename = file.path
        try:
            with open(filename, "r") as f:
                content = f.read()
            self.upload_content(filename, content)
        except IOError as e:
            raise IOError(f"Error reading file {filename}: {e}")

    def upload_manifest(self) -> None:
        manifest_content = json.dumps(self.state.manifest.__dict__, indent=2)
        self.upload_content("manifest.json", manifest_content)

    def delete_file(self, file: RemoteFile) -> None:
        try:
            curl_delete = CurlDelete(file.uuid)
            result = curl_delete.perform_request()
            print(f"Successfully deleted: {file.path}")
            print(f"Response: {result}")
        except Exception as e:
            raise Exception(f"Error deleting file {file.path}: {e}")


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
