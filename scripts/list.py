import os

def list_directory(path, indent=0, prefix=''):
    """Recursively list directory contents with tree structure."""
    # List of directories and files to ignore (case-insensitive)
    IGNORE_DIRS = {'node_modules', 'dist', '.git', '__pycache__', 'venv', 'env', '.idea', '.vscode'}
    IGNORE_FILES = {'readme.md', 'readme.txt'}
    
    try:
        # List all entries in the directory
        entries = [e for e in os.scandir(path) 
                  if not (e.name.startswith('.') or 
                         e.name.lower() in IGNORE_DIRS or 
                         (not e.is_dir() and e.name.lower() in IGNORE_FILES))]
        
        # Sort directories first, then files, both alphabetically
        entries.sort(key=lambda x: (not x.is_dir(), x.name.lower()))
        
        for i, entry in enumerate(entries):
            # Determine if this is the last entry
            is_last = i == len(entries) - 1
            
            # Print current entry with proper indentation
            print(prefix + ('└── ' if is_last else '├── ') + entry.name)
            
            # If it's a directory, recurse into it
            if entry.is_dir():
                new_prefix = prefix + ('    ' if is_last else '│   ')
                list_directory(entry.path, indent + 1, new_prefix)
                
    except PermissionError:
        print(prefix + '└── [Permission Denied]')

def main():
    # Get the current working directory
    current_dir = os.getcwd()
    print(f"Directory structure of: {current_dir}")
    print("-" * 50)
    
    # Start listing from the current directory
    print(os.path.basename(current_dir))
    list_directory(current_dir)

if __name__ == "__main__":
    main()
