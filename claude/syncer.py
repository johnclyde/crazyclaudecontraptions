import json
import os
import shutil
import subprocess
import tempfile


def get_local_files(directory: str):
    local_files = set()
    for root, _, files in os.walk(directory):
        if "node_modules" in root or "build" in root:
            continue
        for file in files:
            # if file.endswith((".js", ".ts", ".tsx", "py")):
            if file.endswith((".yml")):
                rel_path = os.path.relpath(os.path.join(root, file), directory)
                local_files.add(rel_path)
    return local_files


def fetch_remote_files():
    try:
        result = subprocess.run(
            ["./fetch_project_files"], capture_output=True, text=True, shell=True
        )
        remote_files = json.loads(result.stdout)
        if isinstance(remote_files, list):
            return {file["file_name"] for file in remote_files if "file_name" in file}
        return set(remote_files.keys())
    except subprocess.CalledProcessError as e:
        print(f"Error running fetch_react_files: {e}")
        return None
    except json.JSONDecodeError:
        print("Error parsing JSON output from fetch_react_files")
        return None


def compare_files(local_files, remote_files):
    only_local = local_files - remote_files
    only_remote = remote_files - local_files
    partial_matches = []

    for local_file in only_local.copy():
        local_filename = os.path.basename(local_file)
        for remote_file in only_remote:
            if remote_file.endswith(local_filename):
                partial_matches.append((local_file, remote_file))
                only_local.remove(local_file)
                only_remote.remove(remote_file)
                break

    return only_local, only_remote, partial_matches


def modify_and_execute_script(file_path: str) -> None:
    """Run a curl by copying a generic script and replacing two WILDCARDS.

    I gave up on figuring out why a simple native python curl wouldn't do the trick."""
    with open(file_path, "r") as file:
        file_contents = file.read()
    json_safe_content = file_contents.replace('"', '\\"').replace("\n", "\\n")

    original_script = "./upload_project_file_TEMPLATE"
    with open(original_script, "r") as file:
        script_content = file.read()

    with tempfile.TemporaryDirectory() as temp_dir:
        new_script_path = os.path.join(temp_dir, "new_script.sh")
        modified_content = script_content.replace("FILENAME", file_path)
        modified_content = modified_content.replace("CONTENTSJSON", json_safe_content)

        with open(new_script_path, "w") as file:
            file.write(modified_content)

        os.chmod(new_script_path, 0o755)
        subprocess.run(new_script_path, shell=True)


def main() -> None:
    print("Analyzing files...")
    local_files = get_local_files(".")
    remote_files = fetch_remote_files()

    if remote_files is None:
        raise Exception(
            "Failed to fetch remote files. Try running the curl in ./fetch_project_files."
        )

    only_local, only_remote, partial_matches = compare_files(local_files, remote_files)

    if only_local:
        print("\nFiles to upload:")
        for file_path in sorted(only_local):
            response = input(f"Upload {file_path}? (y/n): ").lower().strip()
            if response == "y":
                modify_and_execute_script(file_path)
                print(f"Uploaded: {file_path}")

    if only_remote:
        print("\nFiles to download:")
        for file in sorted(only_remote):
            print(f"- {file}")

    if partial_matches:
        print("\nFiles with potential path mismatches:")
        for local, remote in sorted(partial_matches):
            print(f"? {local} <-> {remote}")

    if not (only_local or only_remote or partial_matches):
        print("\nAll files are in sync!")


if __name__ == "__main__":
    main()
