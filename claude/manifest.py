import json
from dataclasses import dataclass
import os

MANIFEST_FILE = "sync_manifest.json"


@dataclass
class Manifest:
    files: list[dict[str, str]]
    rules: list[dict[str, str]]

    @classmethod
    def load_from_file(cls, filename="manifest.json") -> "Manifest":
        with open(filename, "r") as f:
            data = json.load(f)
            files = data.get("files", [])
            rules = data.get("rules", [])
        return Manifest(files, rules)

    def save_to_file(self, filename="manifest.json") -> None:
        with open(filename, "w") as f:
            json.dump(self.__dict__, f, indent=2)


def build_manifest(self) -> Manifest:
    files = [
        {"path": f.path, "status": f.status}
        for f in self.local_files + self.remote_files
    ]
    return Manifest(files, self.additional_local_directories)


def load_manifest() -> dict[str, str]:
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, "r") as f:
            return json.load(f)
    return {}


def save_manifest(manifest: dict[str, str]):
    with open(MANIFEST_FILE, "w") as f:
        json.dump(manifest, f, indent=2)


def update_manifest(manifest: dict[str, str]) -> dict[str, str]:
    print("Current manifest:")
    for local, remote in manifest.items():
        print(f"{local} -> {remote}")

    suggested_mappings = []
    for partial_match in state.partial_matches:
        suggested_mappings.append(
            (partial_match.local_file.path, partial_match.remote_file.path)
        )

    print("\nSuggested mappings:")
    for local, remote in suggested_mappings:
        print(f"{local} -> {remote}")

    while True:
        local = input("Enter local path (or 'done' to finish): ")
        if local.lower() == "done":
            break
        remote = input("Enter corresponding remote path: ")
        manifest[local] = remote

    save_manifest(manifest)
    print("Manifest updated and saved.")
    return manifest
