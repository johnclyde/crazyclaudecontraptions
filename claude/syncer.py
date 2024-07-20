import json
import os
import subprocess
import tempfile

from dotenv import load_dotenv

load_dotenv()

domain: str = os.getenv("DOMAIN", "")
organization: str = os.getenv("ORGANIZATION", "")
project: str = os.getenv("PROJECT", "")
session_key: str = os.getenv("SESSION_KEY", "")
url: str = f"{domain}/api/organizations/{organization}/projects/{project}/docs"
user_agent: str = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


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


def fetch_remote_files() -> tuple[dict[str, str], set[str]] | None:
    curl_command: str = (
        f"curl '{url}' -H 'cookie: sessionKey={session_key}' -H 'user-agent: {user_agent}'"
    )
    with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".sh") as temp_file:
        temp_file.write(curl_command)
        temp_file_path: str = temp_file.name

    try:
        result: subprocess.CompletedProcess = subprocess.run(
            ["sh", temp_file_path], capture_output=True, text=True, check=True
        )
        remote_files: list[dict] = json.loads(result.stdout)
        uuid_map: dict[str, str] = {
            file["file_name"]: file["uuid"] for file in remote_files
        }
        file_names: set[str] = set(uuid_map.keys())
        return uuid_map, file_names
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"Error fetching remote files: {e}")
        return None
    finally:
        os.remove(temp_file_path)


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


def execute_curl_command(command: str) -> None:
    with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".sh") as temp_file:
        temp_file.write(command)
        temp_file_path: str = temp_file.name

    try:
        subprocess.run(
            ["sh", temp_file_path], capture_output=True, text=True, check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e.stderr}")
    finally:
        os.remove(temp_file_path)


def remove_file(file_path: str, doc_uuid: str) -> None:
    curl_command: str = f"""
    curl '{url}/{doc_uuid}' \\
      -X 'DELETE' \\
      -H 'cookie: sessionKey={session_key}' \\
      -H 'user-agent: {user_agent}' \\
      -H 'content-type: application/json' \\
      --data-raw '{{"docUuid":"{doc_uuid}"}}'
    """
    execute_curl_command(curl_command)
    print(f"Successfully deleted: {file_path}")


def upload_file(file_path: str) -> None:
    try:
        with open(file_path, "r") as file:
            content: str = file.read()

        json_content: str = json.dumps(content)
        curl_command: str = f"""
        curl '{url}' \\
          -H 'cookie: sessionKey={session_key}' \\
          -H 'user-agent: {user_agent}' \\
          -H 'content-type: application/json' \\
          --data-raw '{{"file_name":"{file_path}","content":{json_content}}}'
        """
        execute_curl_command(curl_command)
        print(f"Successfully uploaded: {file_path}")
    except IOError as e:
        print(f"Error reading file: {e}")


def display_menu(fetched: bool) -> None:
    print("\nFile Synchronization Menu:")
    print("1. Fetch remote files")
    if fetched:
        print("2. Upload files")
        print("3. Delete remote files")
        print("4. Show files to download")
        print("5. Show potential path mismatches")
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


def main() -> None:
    only_local: set[str] = set()
    only_remote: set[str] = set()
    partial_matches: list[tuple[str, str]] = []
    uuid_map: dict[str, str] = {}
    fetched: bool = False

    while True:
        display_menu(fetched)
        choice: str = input("Enter your choice: ")

        if choice == "1":
            print("Fetching remote files...")
            local_files: set[str] = get_local_files(".")
            remote_data = fetch_remote_files()
            if remote_data is None:
                print("Failed to fetch remote files. Please try again.")
                continue
            uuid_map, remote_files = remote_data
            only_local, only_remote, partial_matches = compare_files(
                local_files, remote_files
            )
            fetched = True
            print("Remote files fetched successfully.")
        elif fetched:
            if choice == "2":
                process_files("upload", only_local)
            elif choice == "3":
                process_files("delete", only_remote, uuid_map)
            elif choice == "4":
                show_files("Files to download", only_remote)
            elif choice == "5":
                show_path_mismatches(partial_matches)
        elif choice == "0":
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

    if fetched and not (only_local or only_remote or partial_matches):
        print("\nAll files are in sync!")


if __name__ == "__main__":
    main()
