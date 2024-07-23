from enum import Enum, auto

from sync_state import File, LocalFile, PartialMatch, RemoteFile, SyncManager, SyncState


class MenuChoice(Enum):
    FETCH_REMOTE = auto()
    UPLOAD_FILES = auto()
    DELETE_REMOTE = auto()
    SHOW_DOWNLOADS = auto()
    SHOW_MISMATCHES = auto()
    LIST_ALL_FILES = auto()
    SHOW_MANIFEST = auto()
    SHOW_ADDITIONAL_DIRS = auto()
    SAVE_MANIFEST = auto()
    EXIT = 0


def display_menu(state: SyncState) -> MenuChoice:
    fetched = state.fetched
    print("\nFile Synchronization Menu:")
    print(f"{MenuChoice.FETCH_REMOTE.value}. Fetch remote files")
    if fetched:
        print(f"{MenuChoice.UPLOAD_FILES.value}. Upload files")
        print(f"{MenuChoice.DELETE_REMOTE.value}. Delete remote files")
        print(f"{MenuChoice.SHOW_DOWNLOADS.value}. Show files to download")
        print(f"{MenuChoice.SHOW_MISMATCHES.value}. Show potential path mismatches")
        print(f"{MenuChoice.LIST_ALL_FILES.value}. List all pertinent files and their status")
        print(f"{MenuChoice.SHOW_MANIFEST.value}. Show manifest")
        print(f"{MenuChoice.SHOW_ADDITIONAL_DIRS.value}. Show additional local directories")
        print(f"{MenuChoice.SAVE_MANIFEST.value}. Save manifest")

        # Adding suggested option
        if state.partial_matches:
            print("\nSuggested action: Apply suggested mappings to resolve path mismatches.")
            print(f"For this, consider selecting {MenuChoice.SHOW_MISMATCHES.value} to view mismatches or {MenuChoice.SAVE_MANIFEST.value} to save the updated manifest after review.")

    print(f"{MenuChoice.EXIT.value}. Exit")

    while True:
        try:
            choice = int(input("Enter your choice: "))
            if choice == MenuChoice.EXIT.value:
                return MenuChoice.EXIT
            elif choice == MenuChoice.FETCH_REMOTE.value:
                return MenuChoice.FETCH_REMOTE
            elif (
                fetched
                and MenuChoice.UPLOAD_FILES.value
                <= choice
                <= MenuChoice.SAVE_MANIFEST.value
            ):
                return MenuChoice(choice)
            raise ValueError
        except ValueError:
            print("Invalid choice. Please try again.")


def show_files(title: str, files: list[File]) -> None:
    print(f"\n{title}:")
    for file in sorted(files, key=lambda f: f.path):
        print(f"- {file.path}")
    input("Press Enter to continue...")


def show_path_mismatches(partial_matches: list[PartialMatch]) -> None:
    print("\nFiles with potential path mismatches:")
    for match in sorted(partial_matches, key=lambda m: m.local_file.path):
        print(f"? {match.local_file.path} <-> {match.remote_file.path}")
    input("Press Enter to continue...")


def list_all_files(state: SyncState) -> None:
    print("\nAll pertinent files and their status:")
    print("\nFiles only in local:")
    for file in sorted(state.get_only_local(), key=lambda f: f.path):
        print(f"+ {file.path}")

    print("\nFiles only in remote:")
    for file in sorted(state.get_only_remote(), key=lambda f: f.path):
        print(f"- {file.path}")

    print("\nFiles with potential path mismatches:")
    for match in sorted(state.partial_matches, key=lambda m: m.local_file.path):
        print(f"? {match.local_file.path} <-> {match.remote_file.path}")

    input("Press Enter to continue...")


def show_manifest(state: SyncState) -> None:
    manifest = state.build_manifest()
    print("\nManifest:")
    for file in sorted(manifest.files, key=lambda f: f["path"]):
        print(f"{file['status']}: {file['path']}")
    print("\nAdditional local directories:")
    for dir in manifest.additional_local_directories:
        print(f"- {dir}")
    input("Press Enter to continue...")
