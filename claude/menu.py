from enum import Enum, auto


class MenuChoice(Enum):
    FETCH_REMOTE = auto()
    UPLOAD_FILES = auto()
    DELETE_REMOTE = auto()
    SHOW_DOWNLOADS = auto()
    SHOW_MISMATCHES = auto()
    LIST_ALL_FILES = auto()
    UPLOAD_MANIFEST = auto()
    EXIT = 0


def display_menu(fetched: bool, manifest_status: tuple[bool, bool]) -> MenuChoice:
    print("\nFile Synchronization Menu:")
    print(f"{MenuChoice.FETCH_REMOTE.value}. Fetch remote files")
    if fetched:
        print(f"{MenuChoice.UPLOAD_FILES.value}. Upload files")
        print(f"{MenuChoice.DELETE_REMOTE.value}. Delete remote files")
        print(f"{MenuChoice.SHOW_DOWNLOADS.value}. Show files to download")
        print(f"{MenuChoice.SHOW_MISMATCHES.value}. Show potential path mismatches")
        print(
            f"{MenuChoice.LIST_ALL_FILES.value}. List all pertinent files and their status"
        )
        if manifest_status[0] and not manifest_status[1]:
            print(f"{MenuChoice.UPLOAD_MANIFEST.value}. Upload manifest.json")
    print(f"{MenuChoice.EXIT.value}. Exit")

    while True:
        try:
            choice = int(input("Enter your choice: "))
            if choice == MenuChoice.EXIT.value:
                return MenuChoice.EXIT
            elif choice == MenuChoice.FETCH_REMOTE.value:
                return MenuChoice.FETCH_REMOTE
            elif fetched:
                if (
                    MenuChoice.UPLOAD_FILES.value
                    <= choice
                    <= MenuChoice.LIST_ALL_FILES.value
                ):
                    return MenuChoice(choice)
                elif (
                    choice == MenuChoice.UPLOAD_MANIFEST.value
                    and manifest_status[0]
                    and not manifest_status[1]
                ):
                    return MenuChoice.UPLOAD_MANIFEST
            raise ValueError
        except ValueError:
            print("Invalid choice. Please try again.")


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
