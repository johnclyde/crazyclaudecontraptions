from delete_menu import DeleteMenu
from file_list_menu import FileListMenu
from menu import Menu, MenuAction, MenuOption
from sync_state import SyncManager


class MainMenu(Menu):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("File Synchronization Menu")
        self.sync_manager = sync_manager

    def update_options(self) -> None:
        self.options.clear()
        self.add_option(FetchRemoteOption(self.sync_manager))

        if self.sync_manager.state.fetched:
            self.add_option(DeleteMenu(self.sync_manager))
            self.add_option(FileListMenu(self.sync_manager))
            self.add_option(ShowManifestOption(self.sync_manager))
            self.add_option(UploadManifestOption(self.sync_manager))
            self.add_option(SaveManifestOption(self.sync_manager))


class FetchRemoteOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Fetch remote files")
        self.sync_manager = sync_manager

    def run(self) -> MenuAction:
        print("Fetching remote files...")
        self.sync_manager.fetch_and_compare()
        print("Remote files fetched successfully.")
        return MenuAction.CONTINUE


class ShowManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Show manifest")
        self.sync_manager = sync_manager

    def run(self) -> MenuAction:
        state = self.sync_manager.state
        manifest = state.manifest
        print("\nManifest:")
        for file in sorted(manifest.files, key=lambda f: f["path"]):
            print(f"{file['status']}: {file['path']}")
        for rule in manifest.rules:
            print(f"Rule: {rule}")
        return MenuAction.CONTINUE


class UploadManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Upload manifest")
        self.sync_manager = sync_manager

    def run(self) -> MenuAction:
        self.sync_manager.upload_manifest()
        return MenuAction.CONTINUE


class SaveManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Save manifest")
        self.sync_manager = sync_manager

    def run(self) -> MenuAction:
        self.sync_manager.save_manifest()
        return MenuAction.CONTINUE
