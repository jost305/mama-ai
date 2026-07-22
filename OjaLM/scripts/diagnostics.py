import sys
import platform
import psutil
import importlib

try:
    import torch
except ImportError:
    torch = None

def run_diagnostics():
    print("="*50)
    print("  OjaLM Research Environment Diagnostics")
    print("="*50)
    
    # 1. OS & Environment
    print("\n[ System Information ]")
    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Python Version: {sys.version.split(' ')[0]}")
    
    # 2. RAM
    ram = psutil.virtual_memory()
    print("\n[ Memory ]")
    print(f"Total RAM: {ram.total / (1024**3):.2f} GB")
    print(f"Available RAM: {ram.available / (1024**3):.2f} GB")
    
    # 3. GPU & CUDA
    print("\n[ Hardware & PyTorch ]")
    if torch:
        print(f"PyTorch Version: {torch.__version__}")
        cuda_available = torch.cuda.is_available()
        print(f"CUDA Available: {cuda_available}")
        if cuda_available:
            print(f"CUDA Device Count: {torch.cuda.device_count()}")
            print(f"CUDA Device Name: {torch.cuda.get_device_name(0)}")
        else:
            print("WARNING: No CUDA GPU detected by PyTorch. Training will be extremely slow.")
    else:
        print("PyTorch: NOT INSTALLED")

    # 4. Package Verification
    print("\n[ AI Stack Verification ]")
    packages = [
        "transformers", 
        "peft", 
        "trl", 
        "datasets", 
        "accelerate", 
        "bitsandbytes", 
        "unsloth"
    ]
    
    all_passed = True
    for pkg in packages:
        try:
            mod = importlib.import_module(pkg)
            version = getattr(mod, "__version__", "Unknown")
            print(f"✓ {pkg.ljust(15)} : {version}")
        except ImportError:
            print(f"✗ {pkg.ljust(15)} : NOT INSTALLED")
            all_passed = False
            
    print("\n" + "="*50)
    if all_passed and torch and torch.cuda.is_available():
        print("STATUS: SUCCESS. Ready for Phase 02 (AfriqueQwen).")
    else:
        print("STATUS: WARNING. Some checks failed or CUDA is missing.")
    print("="*50)

if __name__ == "__main__":
    run_diagnostics()
