import os
import json
from file_types import File, SyncState
from manifest import load_manifest, save_manifest, update_manifest
from curl_helper import CurlGet, CurlPost, CurlDelete

class SyncManager:
    def __init__(self):
        self.state = SyncState()
        self.curl_get = CurlGet()

    def get_local_files(self, directory: str) -> list[File]:
        local_files = []
        for root, _, files in os.walk(directory):
            if "node_modules" in root or "build" in root:
                continue
            for file in files:
                if file.endswith((".js", ".ts", ".tsx", ".py")) or file == "manifest.json":
                    rel_path = os.path.relpath(os.path.join(root, file), directory)
                    local_files.append(File(path=rel_path))
        return local_files

    def fetch_remote_files(self, local_files: list[File]):
        try:
            result = self.curl_get.perform_request()
            remote_files_data = json.loads(result)
            
            remote_files = [File(path=file["file_name"], uuid=file["uuid"]) for file in remote_files_data]
            
            # Use manifest to match local and remote files
            manifest = load_manifest()
            for local_file in local_files:
                for prefix, remote_prefix in manifest.items():
                    if local_file.path.startswith(prefix):
                        remote_path = local_file.path.replace(prefix, remote_prefix, 1)
                        matching_remote = next((rf for rf in remote_files if rf.path == remote_path), None)
                        if matching_remote:
                            local_file.status = "synced"
                            matching_remote.status = "synced"
                        break

            self.state.local_files = local_files
            self.state.remote_files = remote_files
            self.state.fetched = True

        except json.JSONDecodeError as e:
            raise ValueError(f"Error decoding JSON response: {e}")
        except KeyError as e:
            raise ValueError(f"Unexpected response format: {e}")

    def show_unsynced_files(self):
        unsynced = [f for f in self.state.local_files + self.state.remote_files if f.status == "unsynced"]
        if not unsynced:
            print("All files are synced!")
        else:
            print("Files that need syncing:")
            for file in unsynced:
                print(f"- {file.path}")

    def sync_files(self):
        # Implement syncing logic here
        print("Syncing files...")
        # After syncing, update the file statuses
        self.fetch_remote_files(self.state.local_files)

    def update_manifest(self):
        self.manifest = update_manifest(self.manifest)
