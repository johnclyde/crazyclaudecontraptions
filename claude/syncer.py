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


def fetch_remote_files() -> set[str] | None:
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
        if isinstance(remote_files, list):
            return {file["file_name"] for file in remote_files if "file_name" in file}
        return set(remote_files.keys())
    except subprocess.CalledProcessError as e:
        print(f"Error running curl command: {e}")
        return None
    except json.JSONDecodeError:
        print("Error parsing JSON output from curl command")
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

        with tempfile.NamedTemporaryFile(
            delete=False, mode="w", suffix=".sh"
        ) as temp_file:
            temp_file.write(curl_command)
            temp_file_path: str = temp_file.name

        result: subprocess.CompletedProcess = subprocess.run(
            ["sh", temp_file_path], capture_output=True, text=True, check=True
        )
        print(f"Successfully uploaded: {file_path}")
    except IOError as e:
        print(f"Error reading file: {e}")
    except subprocess.CalledProcessError as e:
        print(f"Error uploading file: {e.stderr}")
    finally:
        os.remove(temp_file_path)


def display_menu() -> None:
    print("\nFile Synchronization Menu:")
    print("1. Analyze files")
    print("2. Upload files")
    print("3. Show files to download")
    print("4. Show potential path mismatches")
    print("5. Exit")


def upload_files(only_local: set[str]) -> None:
    print("\nFiles to upload:")
    for i, file_path in enumerate(sorted(only_local), 1):
        print(f"{i}. {file_path}")
    print("0. Go back")

    while True:
        choice: str = input("Enter the number of the file to upload (0 to go back): ")
        if choice == "0":
            break
        try:
            index: int = int(choice) - 1
            if 0 <= index < len(only_local):
                file_path: str = sorted(only_local)[index]
                upload_file(file_path)
            else:
                print("Invalid choice. Please try again.")
        except ValueError:
            print("Invalid input. Please enter a number.")


def show_download_files(only_remote: set[str]) -> None:
    print("\nFiles to download:")
    for file in sorted(only_remote):
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

    while True:
        display_menu()
        choice: str = input("Enter your choice (1-5): ")

        if choice == "1":
            print("Analyzing files...")
            local_files: set[str] = get_local_files(".")
            remote_files: set[str] | None = fetch_remote_files()
            if remote_files is None:
                print("Failed to fetch remote files. Please try again.")
                continue
            only_local, only_remote, partial_matches = compare_files(
                local_files, remote_files
            )
            print("Analysis complete.")
        elif choice == "2":
            if not only_local:
                print("No files to upload. Please analyze files first.")
            else:
                upload_files(only_local)
        elif choice == "3":
            if not only_remote:
                print("No files to download. Please analyze files first.")
            else:
                show_download_files(only_remote)
        elif choice == "4":
            if not partial_matches:
                print("No potential path mismatches found. Please analyze files first.")
            else:
                show_path_mismatches(partial_matches)
        elif choice == "5":
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

    if not (only_local or only_remote or partial_matches):
        print("\nAll files are in sync!")


if __name__ == "__main__":
    main()
