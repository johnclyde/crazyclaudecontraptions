from enum import Enum, auto

from sync_manager import SyncManager


class MenuChoice(Enum):
    FETCH = auto()
    SHOW_STATUS = auto()
    SHOW_UNSYNCED = auto()
    SYNC = auto()
    UPDATE_MANIFEST = auto()
    EXIT = auto()


def display_menu(fetched: bool):
    print("\nSync Menu:")
    print(f"{MenuChoice.FETCH.value}. Fetch remote files")
    print(f"{MenuChoice.SHOW_STATUS.value}. Show sync status")
    if fetched:
        print(f"{MenuChoice.SHOW_UNSYNCED.value}. Show unsynced files")
        print(f"{MenuChoice.SYNC.value}. Sync files")
    print(f"{MenuChoice.UPDATE_MANIFEST.value}. Update manifest")
    print(f"{MenuChoice.EXIT.value}. Exit")

    while True:
        try:
            choice = int(input("Enter your choice: "))
            return MenuChoice(choice)
        except ValueError:
            print("Invalid choice. Please try again.")


def show_sync_status(sync_manager: SyncManager):
    print("\nSync Status:")
    print(f"Fetched: {'Yes' if sync_manager.state.fetched else 'No'}")
    print(f"Total local files: {len(sync_manager.state.local_files)}")
    print(f"Total remote files: {len(sync_manager.state.remote_files)}")

    unsynced_local = [
        f for f in sync_manager.state.local_files if f.status == "unsynced"
    ]
    unsynced_remote = [
        f for f in sync_manager.state.remote_files if f.status == "unsynced"
    ]

    print(f"Unsynced local files: {len(unsynced_local)}")
    print(f"Unsynced remote files: {len(unsynced_remote)}")


def main():
    sync_manager = SyncManager()

    while True:
        choice = display_menu(sync_manager.state.fetched)

        if choice == MenuChoice.EXIT:
            print("Exiting...")
            break
        elif choice == MenuChoice.FETCH:
            print("Fetching remote files...")
            try:
                local_files = sync_manager.get_local_files(".")
                sync_manager.fetch_remote_files(local_files)
                print("Remote files fetched successfully.")
            except Exception as e:
                print(f"Error fetching remote files: {e}")
        elif choice == MenuChoice.SHOW_STATUS:
            show_sync_status(sync_manager)
        elif choice == MenuChoice.SHOW_UNSYNCED and sync_manager.state.fetched:
            sync_manager.show_unsynced_files()
        elif choice == MenuChoice.SYNC and sync_manager.state.fetched:
            sync_manager.sync_files()
        elif choice == MenuChoice.UPDATE_MANIFEST:
            sync_manager.update_manifest()


if __name__ == "__main__":
    main()
