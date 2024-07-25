import json
import os
from abc import ABC
from dataclasses import dataclass, field

from curl_helper import CurlDelete, CurlGet, CurlPost
from manifest import Manifest


@dataclass
class File(ABC):
    local_path: str
    local_contents: str
    remote_path: str
    remote_contents: str
    remote_uuid: str | None

    @property
    def local_present(self) -> bool:
        return self.local_contents != ""

    @property
    def remote_present(self) -> bool:
        return self.remote_uuid is not None

    @property
    def is_fully_synced(self) -> bool:
        if not self.local_present:
            return False
        return self.local_contents == self.remote_contents


@dataclass
class SyncState:
    files: dict[str, File] = field(default_factory=dict)
    fetched: bool = False
    manifest: Manifest = field(default_factory=lambda: Manifest.load_from_file())


class SyncManager:
    def __init__(self):
        self.state = SyncState()
        self.curl_get = CurlGet()

    def fetch_and_compare(self) -> None:
        remote_files = self.fetch_remote_files()
        self.process_remote_files(remote_files)
        self.get_local_files()
        self.state.fetched = True

    def add_file(
        self,
        local_path: str,
        local_contents: str,
        remote_path: str,
        remote_contents: str,
        remote_uuid: str | None,
    ) -> None:
        self.state.files[local_path] = File(
            local_path=local_path,
            local_contents=local_contents,
            remote_path=remote_path,
            remote_contents=remote_contents,
            remote_uuid=remote_uuid,
        )

    def process_remote_files(self, remote_files: list[dict[str, str]]) -> None:
        for remote_file in remote_files:
            remote_path = remote_file["file_name"]
            local_path = self.infer_local_path(remote_path)
            self.add_file(local_path, "", remote_path, remote_file["content"], remote_file["uuid"])

    def get_local_files(self) -> dict[str, str]:
        directory = "."
        for root, _, files in os.walk(directory):
            if "node_modules" in root or "build" in root:
                continue
            for file in files:
                if (
                    not file.endswith((".js", ".ts", ".tsx", ".py"))
                    and file != "manifest.json"
                ):
                    continue
                local_path = os.path.relpath(os.path.join(root, file), directory)
                with open(os.path.join(root, file), "r") as f:
                    contents = f.read()

                if local_path in self.state.files:
                    self.state.files[local_path].local_contents = contents
                    continue

                self.add_file(local_path, contents, "", "", None)

    def infer_local_path(self, remote_path: str) -> str:
        for rule in self.state.manifest.rules:
            if rule["type"] == "directory_match" and remote_path.startswith(
                rule["target"]
            ):
                return remote_path.replace(rule["target"], rule["source"], 1)
        return remote_path

    def save_manifest(self) -> None:
        self.state.manifest.save_to_file()
        print("Manifest saved to manifest.json")

    def fetch_remote_files(self) -> list[dict[str, str]]:
        try:
            result = self.curl_get.perform_request()
            return list(json.loads(result))
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

    def upload_file(self, file: File) -> None:
        filename = file.local_path
        try:
            with open(filename, "r") as f:
                content = f.read()
            self.upload_content(filename, content)
        except IOError as e:
            raise IOError(f"Error reading file {filename}: {e}")

    def upload_manifest(self) -> None:
        manifest_content = json.dumps(self.state.manifest.__dict__, indent=2)
        self.upload_content("manifest.json", manifest_content)

    def delete_file(self, file: File) -> None:
        if not file.remote_present:
            raise Exception(f"Deleting invalid remote: {file}")

        try:
            curl_delete = CurlDelete(file.remote_uuid)
            result = curl_delete.perform_request()
            print(f"Successfully deleted: {file.path}")
            print(f"Response: {result}")
        except Exception as e:
            raise Exception(f"Error deleting file {file.path}: {e}")
