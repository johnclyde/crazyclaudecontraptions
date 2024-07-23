from menu import (
    MenuChoice,
    display_menu,
    list_all_files,
    show_files,
    show_path_mismatches,
)
from sync_state import SyncState, upload_file


def main() -> None:
    sync_state = SyncState()

    while True:
        choice = display_menu(sync_state.fetched, sync_state.manifest_status)

        if choice == MenuChoice.EXIT:
            print("Exiting...")
            break
        elif choice == MenuChoice.FETCH_REMOTE:
            print("Fetching remote files...")
            try:
                sync_state.fetch_and_compare()
                print("Remote files fetched successfully.")
            except Exception as e:
                print(f"Error fetching remote files: {e}")
        elif sync_state.fetched:
            if choice == MenuChoice.UPLOAD_FILES:
                sync_state.process_files("upload", sync_state.only_local)
            elif choice == MenuChoice.DELETE_REMOTE:
                sync_state.process_files("delete", sync_state.only_remote)
            elif choice == MenuChoice.SHOW_DOWNLOADS:
                show_files("Files to download", sync_state.only_remote)
            elif choice == MenuChoice.SHOW_MISMATCHES:
                show_path_mismatches(sync_state.partial_matches)
            elif choice == MenuChoice.LIST_ALL_FILES:
                list_all_files(
                    sync_state.only_local,
                    sync_state.only_remote,
                    sync_state.partial_matches,
                )
            elif choice == MenuChoice.UPLOAD_MANIFEST:
                try:
                    upload_file("manifest.json")
                    sync_state.manifest_status = (True, True)
                except Exception as e:
                    print(f"Error uploading manifest.json: {e}")

    if sync_state.fetched and not (
        sync_state.only_local or sync_state.only_remote or sync_state.partial_matches
    ):
        print("\nAll files are in sync!")


if __name__ == "__main__":
    main()
