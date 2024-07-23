import json
import os

from curl_helper import CurlDelete, CurlGet, CurlPost


def get_local_files(directory: str) -> set[str]:
    local_files: set[str] = set()
    for root, _, files in os.walk(directory):
        if "node_modules" in root or "build" in root:
            continue
        for file in files:
            if file.endswith((".js", ".ts", ".tsx", ".py")) or file == "manifest.json":
                rel_path: str = os.path.relpath(os.path.join(root, file), directory)
                local_files.add(rel_path)
    return local_files


def fetch_remote_files(curl_get: CurlGet) -> tuple[dict[str, str], set[str]]:
    try:
        result: str = curl_get.perform_request()
        remote_files: list[dict] = json.loads(result)
        uuid_map: dict[str, str] = {
            file["file_name"]: file["uuid"] for file in remote_files
        }
        file_names: set[str] = set(uuid_map.keys())
        return uuid_map, file_names
    except json.JSONDecodeError as e:
        raise ValueError(f"Error decoding JSON response: {e}")
    except KeyError as e:
        raise ValueError(f"Unexpected response format: {e}")


def compare_files(
    local_files: set[str], remote_files: set[str]
) -> tuple[set[str], set[str], list[tuple[str, str]]]:
    only_local: set[str] = local_files - remote_files
    only_remote: set[str] = remote_files - local_files
    partial_matches: list[tuple[str, str]] = []
    for local_file in only_local.copy():
        local_filename: str = os.path.basename(local_file)
        for remote_file in only_remote:
            if remote_file.endswith(local_filename):
                partial_matches.append((local_file, remote_file))
                only_local.remove(local_file)
                only_remote.remove(remote_file)
                break
    return only_local, only_remote, partial_matches


def upload_file(file_path: str) -> None:
    try:
        with open(file_path, "r") as file:
            content: str = file.read()
        curl_post = CurlPost(file_path, content)
        result: str = curl_post.perform_request()
        print(f"Successfully uploaded: {file_path}")
        print(f"Response: {result}")
    except IOError as e:
        raise IOError(f"Error reading file {file_path}: {e}")
    except Exception as e:
        raise Exception(f"Error uploading file {file_path}: {e}")


def remove_file(file_path: str, doc_uuid: str) -> None:
    try:
        curl_delete = CurlDelete(doc_uuid)
        result: str = curl_delete.perform_request()
        print(f"Successfully deleted: {file_path}")
        print(f"Response: {result}")
    except Exception as e:
        raise Exception(f"Error deleting file {file_path}: {e}")


def check_manifest(local_files: set[str], remote_files: set[str]) -> tuple[bool, bool]:
    local_manifest = "manifest.json" in local_files
    remote_manifest = "manifest.json" in remote_files
    return local_manifest, remote_manifest


def build_manifest(local_files: set[str], remote_files: set[str]) -> dict:
    manifest = {"files": [], "additional_local_directories": []}

    for file in sorted(local_files):
        file_info = {
            "path": file,
            "status": "local_only" if file not in remote_files else "synced",
        }
        manifest["files"].append(file_info)

        # Check for additional local directory hierarchy
        local_dirs = set(os.path.dirname(f) for f in local_files)
        remote_dirs = set(os.path.dirname(f) for f in remote_files)
        additional_dirs = local_dirs - remote_dirs
        manifest["additional_local_directories"] = sorted(additional_dirs)

    for file in sorted(remote_files - local_files):
        file_info = {"path": file, "status": "remote_only"}
        manifest["files"].append(file_info)

    return manifest


class SyncState:
    def __init__(self):
        self.curl_get = CurlGet()
        self.only_local: set[str] = set()
        self.only_remote: set[str] = set()
        self.partial_matches: list[tuple[str, str]] = []
        self.uuid_map: dict[str, str] = {}
        self.fetched: bool = False
        self.manifest_status: tuple[bool, bool] = (False, False)
        self.manifest: dict = {}

    def fetch_and_compare(self):
        local_files: set[str] = get_local_files(".")
        self.uuid_map, remote_files = fetch_remote_files(self.curl_get)
        self.only_local, self.only_remote, self.partial_matches = compare_files(
            local_files, remote_files
        )
        self.manifest_status = check_manifest(local_files, remote_files)
        self.manifest = build_manifest(local_files, remote_files)
        self.fetched = True

    def process_files(self, action: str, files: set[str]) -> None:
        print(f"\nFiles to {action}:")
        for i, file_path in enumerate(sorted(files), 1):
            print(f"{i}. {file_path}")
        print("0. Go back")

        while True:
            choice: str = input(
                f"Enter the number of the file to {action} (0 to go back): "
            )
            if choice == "0":
                break
            try:
                index: int = int(choice) - 1
                if 0 <= index < len(files):
                    file_path: str = sorted(files)[index]
                    if action == "upload":
                        upload_file(file_path)
                    elif action == "delete":
                        if self.uuid_map and file_path in self.uuid_map:
                            remove_file(file_path, self.uuid_map[file_path])
                        else:
                            print(f"Error: UUID not found for {file_path}")
                else:
                    print("Invalid choice. Please try again.")
            except ValueError:
                print("Invalid input. Please enter a number.")
            except Exception as e:
                print(f"Error: {e}")

    def save_manifest(self):
        with open("manifest.json", "w") as f:
            json.dump(self.manifest, f, indent=2)
        print("Manifest saved to manifest.json")

    def show_additional_directories(self):
        if self.manifest["additional_local_directories"]:
            print("\nAdditional local directories:")
            for dir in self.manifest["additional_local_directories"]:
                print(f"- {dir}")
        else:
            print("\nNo additional local directories found.")
