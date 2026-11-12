import os
import zipfile

def make_zip(output_path, root_dir):
    exclude_dirs = {
        'node_modules',
        '.git',
        '.aistudio',
        'dist',
        '__pycache__',
        '.vite'
    }
    exclude_files = {
        'smartlink-manager-pro.zip',
        '.DS_Store'
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Modify dirs in-place to avoid recursing into excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if file in exclude_files:
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_dir)
                
                # Double-check no excluded path components
                parts = rel_path.split(os.sep)
                if any(p in exclude_dirs for p in parts):
                    continue
                
                zipf.write(file_path, rel_path)
                print(f"Added: {rel_path}")

if __name__ == '__main__':
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    out_zip = os.path.join(project_root, 'public', 'smartlink-manager-pro.zip')
    print(f"Creating ZIP from {project_root} to {out_zip}...")
    make_zip(out_zip, project_root)
    size_mb = os.path.getsize(out_zip) / (1024 * 1024)
    print(f"ZIP creation completed successfully! Size: {size_mb:.2f} MB")
