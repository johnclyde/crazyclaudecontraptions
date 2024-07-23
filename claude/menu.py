from abc import ABC, abstractmethod

from sync_state import PartialMatch, SyncManager, SyncState


class MenuOption:
    def __init__(self, label: str):
        self.label = label

    @abstractmethod
    def run(self):
        pass


class ExitHandler:
    def __init__(self) -> None:
        self.should_exit = False


class Menu(ABC):
    def __init__(self, title: str):
        self.title = title
        self.options: list[MenuOption] = []
        self.exit_handler = ExitHandler()

    def add_option(self, option: MenuOption) -> None:
        self.options.append(option)

    def display(self) -> None:
        print(f"\n{self.title}")
        for index, option in enumerate(self.options, 1):
            print(f"{index}. {option.label}")

    def run(self):
        while not self.exit_handler.should_exit:
            self.update_options()
            self.display()
            choice = int(input("Enter your choice: ")) - 1
            if 0 <= choice < len(self.options):
                self.options[choice].run()
            else:
                print("Invalid choice. Please try again.")

    @abstractmethod
    def update_options(self):
        pass


class MainMenu(Menu):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("File Synchronization Menu")
        self.sync_manager = sync_manager

    def update_options(self):
        self.options.clear()
        self.add_option(FetchRemoteOption(self.sync_manager))

        if self.sync_manager.state.fetched:
            self.add_option(UploadFilesOption(self.sync_manager))
            self.add_option(DeleteRemoteOption(self.sync_manager))
            self.add_option(ShowDownloadsOption(self.sync_manager))
            self.add_option(ShowMismatchesOption(self.sync_manager))
            self.add_option(ListAllFilesOption(self.sync_manager))
            self.add_option(ShowManifestOption(self.sync_manager))
            self.add_option(ShowAdditionalDirsOption(self.sync_manager))
            self.add_option(SaveManifestOption(self.sync_manager))

        self.add_option(ExitOption(self.exit_handler))


class FetchRemoteOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Fetch remote files")
        self.sync_manager = sync_manager

    def run(self):
        print("Fetching remote files...")
        self.sync_manager.fetch_and_compare()
        print("Remote files fetched successfully.")


class UploadFilesOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Upload files")
        self.sync_manager = sync_manager

    def run(self):
        self.sync_manager.process_files(
            "upload", self.sync_manager.state.get_only_local()
        )


class DeleteRemoteOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Delete remote files")
        self.sync_manager = sync_manager

    def run(self):
        self.sync_manager.process_files(
            "delete", self.sync_manager.state.get_only_remote()
        )


class ShowDownloadsOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Show files to download")
        self.sync_manager = sync_manager

    def run(self):
        show_files("Files to download", self.sync_manager.state.get_only_remote())


class ShowMismatchesOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Show potential path mismatches")
        self.sync_manager = sync_manager

    def run(self):
        show_path_mismatches(self.sync_manager.state.partial_matches)


class ListAllFilesOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("List all pertinent files and their status")
        self.sync_manager = sync_manager

    def run(self):
        list_all_files(self.sync_manager.state)


class ShowManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Show manifest")
        self.sync_manager = sync_manager

    def run(self):
        show_manifest(self.sync_manager.state)


class ShowAdditionalDirsOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Show additional local directories")
        self.sync_manager = sync_manager

    def run(self):
        print("\nAdditional local directories:")
        for dir in self.sync_manager.state.additional_local_directories:
            print(f"- {dir}")
        input("Press Enter to continue...")


class SaveManifestOption(MenuOption):
    def __init__(self, sync_manager: SyncManager):
        super().__init__("Save manifest")
        self.sync_manager = sync_manager

    def run(self):
        self.sync_manager.save_manifest()


class ExitOption(MenuOption):
    def __init__(self, exit_handler: ExitHandler):
        super().__init__("Exit")
        self.exit_handler = exit_handler

    def run(self):
        print("Exiting...")
        self.exit_handler.should_exit = True


# Helper functions
def show_files(title: str, files: list[any]) -> None:
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
