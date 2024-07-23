from abc import ABC, abstractmethod

from delete_menu import DeleteMenu
from menu import Menu, MenuOption
from sync_state import PartialMatch, SyncManager, SyncState


class MainMenu(Menu):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("File Synchronization Menu")
        self.sync_manager = sync_manager

    def update_options(self) -> None:
        self.options.clear()
        self.add_option(FetchRemoteOption(self.sync_manager))

        if self.sync_manager.state.fetched:
            self.add_option(UploadFilesOption(self.sync_manager))
            self.add_option(DeleteMenu(self.sync_manager))
            self.add_option(ShowDownloadsOption(self.sync_manager))
            self.add_option(ShowMismatchesOption(self.sync_manager))
            self.add_option(ListAllFilesOption(self.sync_manager))
            self.add_option(ShowManifestOption(self.sync_manager))
            self.add_option(ShowAdditionalDirsOption(self.sync_manager))
            self.add_option(SaveManifestOption(self.sync_manager))


class FetchRemoteOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Fetch remote files")
        self.sync_manager = sync_manager

    def run(self) -> None:
        print("Fetching remote files...")
        self.sync_manager.fetch_and_compare()
        print("Remote files fetched successfully.")


class UploadFilesOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Upload files")
        self.sync_manager = sync_manager

    def run(self) -> None:
        self.sync_manager.process_files(
            "upload", self.sync_manager.state.get_only_local()
        )


class ShowDownloadsOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Show files to download")
        self.sync_manager = sync_manager

    def run(self) -> None:
        files = self.sync_manager.state.get_only_remote()
        print(f"\nFiles to download:")
        for file in sorted(files, key=lambda f: f.path):
            print(f"- {file.path}")


class ShowMismatchesOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Show potential path mismatches")
        self.sync_manager = sync_manager

    def run(self) -> None:
        partial_matches = self.sync_manager.state.partial_matches
        print("\nFiles with potential path mismatches:")
        for match in sorted(partial_matches, key=lambda m: m.local_file.path):
            print(f"? {match.local_file.path} <-> {match.remote_file.path}")


class ListAllFilesOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("List all pertinent files and their status")
        self.sync_manager = sync_manager

    def run(self) -> None:
        state = self.sync_manager.state
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


class ShowManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Show manifest")
        self.sync_manager = sync_manager

    def run(self) -> None:
        state = self.sync_manager.state
        manifest = state.build_manifest()
        print("\nManifest:")
        for file in sorted(manifest.files, key=lambda f: f["path"]):
            print(f"{file['status']}: {file['path']}")
        print("\nAdditional local directories:")
        for dir in manifest.additional_local_directories:
            print(f"- {dir}")


class ShowAdditionalDirsOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Show additional local directories")
        self.sync_manager = sync_manager

    def run(self) -> None:
        print("\nAdditional local directories:")
        for dir in self.sync_manager.state.additional_local_directories:
            print(f"- {dir}")
        input("Press Enter to continue...")


class SaveManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Save manifest")
        self.sync_manager = sync_manager

    def run(self) -> None:
        self.sync_manager.save_manifest()
