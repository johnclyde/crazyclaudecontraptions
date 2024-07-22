import json
import os

from curl_helper import CurlDelete, CurlGet, CurlPost


def get_local_files(directory: str) -> set[str]:
    local_files: set[str] = set()
    for root, _, files in os.walk(directory):
        if "node_modules" in root or "build" in root:
            continue
        for file in files:
            if file.endswith((".js", ".ts", ".tsx", ".py")):
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


def remove_file(file_path: str, doc_uuid: str) -> None:
    try:
        curl_delete = CurlDelete(doc_uuid)
        result: str = curl_delete.perform_request()
        print(f"Successfully deleted: {file_path}")
        print(f"Response: {result}")
    except Exception as e:
        raise Exception(f"Error deleting file {file_path}: {e}")


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


def display_menu(fetched: bool) -> None:
    print("\nFile Synchronization Menu:")
    print("1. Fetch remote files")
    if fetched:
        print("2. Upload files")
        print("3. Delete remote files")
        print("4. Show files to download")
        print("5. Show potential path mismatches")
        print("6. List all pertinent files and their status")
    print("0. Exit")


def process_files(
    action: str, files: set[str], uuid_map: dict[str, str] | None = None
) -> None:
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
                    if uuid_map and file_path in uuid_map:
                        remove_file(file_path, uuid_map[file_path])
                    else:
                        print(f"Error: UUID not found for {file_path}")
            else:
                print("Invalid choice. Please try again.")
        except ValueError:
            print("Invalid input. Please enter a number.")
        except Exception as e:
            print(f"Error: {e}")


def show_files(title: str, files: set[str]) -> None:
    print(f"\n{title}:")
    for file in sorted(files):
        print(f"- {file}")
    input("Press Enter to continue...")


def show_path_mismatches(partial_matches: list[tuple[str, str]]) -> None:
    print("\nFiles with potential path mismatches:")
    for local, remote in sorted(partial_matches):
        print(f"? {local} <-> {remote}")
    input("Press Enter to continue...")


def list_all_files(
    only_local: set[str], only_remote: set[str], partial_matches: list[tuple[str, str]]
) -> None:
    print("\nAll pertinent files and their status:")
    print("\nFiles only in local:")
    for file in sorted(only_local):
        print(f"+ {file}")

    print("\nFiles only in remote:")
    for file in sorted(only_remote):
        print(f"- {file}")

    print("\nFiles with potential path mismatches:")
    for local, remote in sorted(partial_matches):
        print(f"? {local} <-> {remote}")

    input("Press Enter to continue...")


def main() -> None:
    curl_get = CurlGet()
    only_local: set[str] = set()
    only_remote: set[str] = set()
    partial_matches: list[tuple[str, str]] = []
    uuid_map: dict[str, str] = {}
    fetched: bool = False

    while True:
        display_menu(fetched)
        choice: str = input("Enter your choice: ")

        if choice == "0":
            print("Exiting...")
            break
        elif choice == "1":
            print("Fetching remote files...")
            try:
                local_files: set[str] = get_local_files(".")
                uuid_map, remote_files = fetch_remote_files(curl_get)
                only_local, only_remote, partial_matches = compare_files(
                    local_files, remote_files
                )
                fetched = True
                print("Remote files fetched successfully.")
            except Exception as e:
                print(f"Error fetching remote files: {e}")
        elif fetched:
            if choice == "2":
                process_files("upload", only_local)
            elif choice == "3":
                process_files("delete", only_remote, uuid_map)
            elif choice == "4":
                show_files("Files to download", only_remote)
            elif choice == "5":
                show_path_mismatches(partial_matches)
            elif choice == "6":
                list_all_files(only_local, only_remote, partial_matches)
        else:
            print("Invalid choice. Please try again.")

    if fetched and not (only_local or only_remote or partial_matches):
        print("\nAll files are in sync!")


if __name__ == "__main__":
    main()
