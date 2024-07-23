import json
import os

MANIFEST_FILE = "sync_manifest.json"

def load_manifest() -> dict[str, str]:
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_manifest(manifest: dict[str, str]):
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)

def update_manifest(manifest: dict[str, str]) -> dict[str, str]:
    print("Current manifest:")
    for local, remote in manifest.items():
        print(f"{local} -> {remote}")
    
    while True:
        local = input("Enter local path (or 'done' to finish): ")
        if local.lower() == 'done':
            break
        remote = input("Enter corresponding remote path: ")
        manifest[local] = remote

    save_manifest(manifest)
    print("Manifest updated and saved.")
    return manifest
