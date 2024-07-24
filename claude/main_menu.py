from delete_menu import DeleteMenu
from menu import Menu, MenuOption
from sync_state import SyncManager


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
            self.add_option(ListAllFilesOption(self.sync_manager))
            self.add_option(ShowManifestOption(self.sync_manager))
            self.add_option(UploadManifestOption(self.sync_manager))
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
        print("\nFiles to download:")
        for file in sorted(files, key=lambda f: f.path):
            print(f"- {file.path}")


class ListAllFilesOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("List all files")
        self.sync_manager = sync_manager

    def run(self) -> None:
        state = self.sync_manager.state
        print(f"{'File Path':<55} | {'Local':<8} | Remote")
        print("-" * 75)

        all_files = set(f.path for f in state.local_files + state.remote_files)

        for file_path in sorted(all_files):
            local_file = next(
                (f for f in state.local_files if f.path == file_path), None
            )
            remote_file = next(
                (f for f in state.remote_files if f.path == file_path), None
            )

            local_status = (
                "✅" if local_file and local_file.status != "local_only" else "❌"
            )
            remote_status = (
                "✅" if remote_file and remote_file.status != "remote_only" else "❌"
            )

            print(f"{file_path:<55} | {local_status:<8}| {remote_status}")


class ShowManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Show manifest")
        self.sync_manager = sync_manager

    def run(self) -> None:
        state = self.sync_manager.state
        manifest = state.manifest
        print("\nManifest:")
        for file in sorted(manifest.files, key=lambda f: f["path"]):
            print(f"{file['status']}: {file['path']}")
        for rule in manifest.rules:
            print(f"Rule: {rule}")


class UploadManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Upload manifest")
        self.sync_manager = sync_manager

    def run(self) -> None:
        self.sync_manager.upload_manifest()


class SaveManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Save manifest")
        self.sync_manager = sync_manager

    def run(self) -> None:
        self.sync_manager.save_manifest()
