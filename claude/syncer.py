from menu import (
    MenuChoice,
    display_menu,
    list_all_files,
    show_files,
    show_manifest,
    show_path_mismatches,
)
from sync_state import SyncManager


def main() -> None:
    sync_manager = SyncManager()

    while True:
        choice = display_menu(sync_manager.state)

        if choice == MenuChoice.EXIT:
            print("Exiting...")
            break
        elif choice == MenuChoice.FETCH_REMOTE:
            print("Fetching remote files...")
            try:
                sync_manager.fetch_and_compare()
                print("Remote files fetched successfully.")
            except Exception as e:
                print(f"Error fetching remote files: {e}")
        elif sync_manager.state.fetched:
            if choice == MenuChoice.UPLOAD_FILES:
                sync_manager.process_files(
                    "upload", sync_manager.state.get_only_local()
                )
            elif choice == MenuChoice.DELETE_REMOTE:
                sync_manager.process_files(
                    "delete", sync_manager.state.get_only_remote()
                )
            elif choice == MenuChoice.SHOW_DOWNLOADS:
                show_files("Files to download", sync_manager.state.get_only_remote())
            elif choice == MenuChoice.SHOW_MISMATCHES:
                show_path_mismatches(sync_manager.state.partial_matches)
            elif choice == MenuChoice.LIST_ALL_FILES:
                list_all_files(sync_manager.state)
            elif choice == MenuChoice.SHOW_MANIFEST:
                show_manifest(sync_manager.state)
            elif choice == MenuChoice.SHOW_ADDITIONAL_DIRS:
                print("\nAdditional local directories:")
                for dir in sync_manager.state.additional_local_directories:
                    print(f"- {dir}")
                input("Press Enter to continue...")
            elif choice == MenuChoice.SAVE_MANIFEST:
                sync_manager.save_manifest()

    if sync_manager.state.fetched and not (
        sync_manager.state.get_only_local()
        or sync_manager.state.get_only_remote()
        or sync_manager.state.partial_matches
    ):
        print("\nAll files are in sync!")


if __name__ == "__main__":
    main()
