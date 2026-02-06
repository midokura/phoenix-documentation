# GPU Server Verification

Verifying GPU server configuration before running ML workloads.

Before starting expensive distributed training workloads on your newly deployed GPU bare-metal server, you should verify that the software stack is correctly configured. This guide shows you how to use pre-installed verification scripts to check GPU, RDMA, and GPUDirect RDMA configuration.

## Quick Verification Checklist

The following command sequence is sufficient for a complete verification:

```bash
nvidia-smi                    # GPU detected?
source /opt/pytorch-venv/bin/activate
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
verify-rdma                   # RDMA stack configured?
verify-gpudirect              # GPUDirect RDMA ready?
test-nccl                     # Single-server test (requires 2+ GPUs)
```

> **Note:** RDMA verification is only required for multi-server distributed training. For single-server workloads (including multi-GPU), you only need GPU verification (`nvidia-smi` and PyTorch CUDA check).

For multi-server testing, see the [test-nccl](#test-nccl) section.

## Technical Specifications

Reference for the GPU server software stack:

| Component | Version/Details |
|-----------|-----------------|
| Base OS | Ubuntu 24.04 (kernel 6.8+) |
| NVIDIA Driver | v570.x (open-source, Canonical repo) |
| CUDA | v12.8 runtime and development packages |
| RDMA Method | DMA-BUF with inbox kernel drivers |
| RDMA Packages | rdma-core, ibverbs-utils, infiniband-diags, perftest |
| NCCL | Pre-configured for RoCE (TC 104 / DSCP 26) |
| PyTorch Environment | /opt/pytorch-venv (Python 3.12, PyTorch 2.8.0+cu128) |
| Monitoring | node_exporter (9100), dcgm-exporter (9400) |

## Verification Scripts Reference

### nvidia-smi

**Purpose**: Verify NVIDIA driver is loaded and GPUs are detected.

**When to use**: First check after deployment. If this fails, stop here and fix GPU detection or driver installation.

**What it checks**:
- NVIDIA driver loaded
- GPU devices visible to the OS
- GPU memory and compute capabilities

**Hardware dependencies**: NVIDIA GPU installed and detected.

#### How to run

```bash
nvidia-smi
```

**Expected output**:

```
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 570.124.06             Driver Version: 570.124.06     CUDA Version: 12.8     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA H100 80GB HBM3          Off |   00000000:17:00.0 Off |                    0 |
| N/A   30C    P0             70W /  700W |       0MiB /  81559MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
```

**Interpreting results**:
- All GPUs should be listed with correct memory capacity
- CUDA version should be 12.8 or newer
- Expect low power usage, lower temperatures, and no memory usage while idle

#### Troubleshooting

1. **GPU Not Detected**

    - **Symptom**: `nvidia-smi` fails with "No devices were found" or command not found.
    - **Check**:
      ```bash
      # Check if driver is loaded
      lsmod | grep nvidia

      # Check for NVIDIA GPU in PCI devices
      lspci | grep -i nvidia

      # Check driver installation
      dpkg -l | grep nvidia-driver
      ```
    - **Solution**:
      - If PCI device not found: Check BIOS settings (ensure PCIe slots enabled) or verify GPU is properly seated
      - If driver not loaded: Install NVIDIA driver (`apt install nvidia-driver-570-open`)
      - If nvidia-smi not found: Install CUDA toolkit (`apt install nvidia-utils-570`)

----

### pytorch CUDA verification

**Purpose**: Verify PyTorch environment and CUDA runtime integration.

**When to use**: After confirming `nvidia-smi` works. This checks that your Python environment can access GPUs.

**What it checks**:
- PyTorch venv activation
- CUDA availability in PyTorch
- GPU device count
- Basic tensor operations on GPU

**Hardware dependencies**: NVIDIA GPU with CUDA runtime installed.

#### How to run

```bash
source /opt/pytorch-venv/bin/activate
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'GPU count: {torch.cuda.device_count()}')"
```

**Expected output**:

```
CUDA available: True
GPU count: 8
```

**Interpreting results**:
- `CUDA available: True` confirms PyTorch can use CUDA
- GPU count should match hardware

----

### verify-rdma

**Purpose**: Verify RDMA network stack configuration for multi-server distributed training.

**When to use**: After GPU checks pass. Useful for servers participating in multi-server training.

**What it checks**:
- Inbox kernel modules (ib_core, rdma_cm, ib_uverbs, mlx5_core, mlx5_ib)
- RDMA devices detected via ibv_devinfo
- RDMA link status (active ports)
- MTU configuration (active vs max supported)
- RoCE v2 traffic class QoS settings (ToS 104 / DSCP 26 / TC3)
- rdma-cm-tos.service status
- NCCL environment variables

**Hardware dependencies**: Mellanox ConnectX-4 or newer with RoCE v2 capability. Requires lossless Ethernet configuration on the network switch.

#### How to run

```bash
verify-rdma
```

**Expected output** (with Mellanox NIC hardware):

```
==========================================
Inbox RDMA Kernel Modules
==========================================
[OK] ib_core loaded
[OK] rdma_cm loaded
[OK] ib_uverbs loaded
[OK] mlx5_core loaded
[OK] mlx5_ib loaded

==========================================
RDMA Devices
==========================================
[OK] mlx5_0 port 1: PORT_ACTIVE
[OK] RDMA links visible

--- rdma link show ---
link mlx5_0/1 state ACTIVE physical_state LINK_UP netdev ens1f0np0

==========================================
MTU Configuration
==========================================
[OK] mlx5_0 port 1: active_mtu=4096 (max supported)

==========================================
RoCE Traffic Class (QoS)
==========================================
Lossless RoCE requires proper QoS configuration.
Traffic class for lossless RoCE (ToS 104 = DSCP 26 = TC3)

[OK] rdma-cm-tos.service is enabled
[OK] rdma-cm-tos.service is active
[OK] mlx5_0: RDMA-CM ToS=104 (DSCP 26 = TC3)

NCCL Traffic Class setting:
[OK] NCCL_IB_TC=104 configured in /etc/profile.d/nccl-rdma.sh

==========================================
Results
==========================================
OK: 10  WARN: 0  FAIL: 0
```

**Interpreting results**:
- **[OK]**: Component is correctly configured
- **[WARN]**: Component detected but not optimally configured - investigate but may not block basic functionality
- **[FAIL]**: Configuration problem that must be fixed for RDMA to work

On a bare-metal GPU server, you should see mostly `[OK]` results. Any `[FAIL]` indicates misconfiguration that must be addressed.

#### Troubleshooting

1. **RDMA Verification Shows FAIL (Not WARN)**

    - **Symptom**: `verify-rdma` shows `[FAIL]` results on deployed instance with Mellanox NIC.
    - **Check**:
      ```bash
      # Check if NIC is detected
      lspci | grep -i mellanox

      # Check kernel modules
      lsmod | grep mlx5

      # Check dmesg for errors
      dmesg | grep -i mlx5
      ```
    - **Solution**:
      - If NIC not in `lspci`: Hardware not detected, check PCIe slot or BIOS settings
      - If modules not loaded: `modprobe mlx5_core && modprobe mlx5_ib`
      - If ibverbs-utils not installed: `apt install ibverbs-utils infiniband-diags`

----

### verify-gpudirect

**Purpose**: Verify GPUDirect RDMA setup using DMA-BUF.

**When to use**: After both GPU and RDMA checks pass. This verifies that GPU memory can be accessed directly by the RDMA NIC.

**What it checks**:
- NVIDIA driver status and GPU detection
- Kernel P2PDMA support (CONFIG_PCI_P2PDMA=y)
- nvidia-open driver (required for DMA-BUF)
- Kernel version compatibility (6.2+ for full DMA-BUF support)
- Legacy nvidia-peermem status (should NOT be loaded)
- NCCL environment variables
- PyTorch NCCL backend availability

**Hardware dependencies**: Both NVIDIA GPU and Mellanox ConnectX NIC required. For optimal performance, GPU and NIC should be on the same PCI switch or NUMA node.

#### How to run

```bash
verify-gpudirect
```

**Expected output** (with GPU and Mellanox NIC):

```
==========================================
NVIDIA Driver Status
==========================================
570.124.06, NVIDIA H100 80GB HBM3, 81559 MiB
[OK] NVIDIA GPU detected and driver loaded

==========================================
DMA-BUF Support (NVIDIA-Recommended Method)
==========================================
DMA-BUF is the modern method for GPUDirect RDMA.
Requires: nvidia-open driver + kernel with CONFIG_PCI_P2PDMA=y

[OK] Kernel has CONFIG_PCI_P2PDMA=y (P2P DMA enabled)

[OK] Using nvidia-open driver (DMA-BUF supported)

[OK] Kernel 6.8 supports DMA-BUF (6.2+ required)

==========================================
Legacy nvidia-peermem (Not Used)
==========================================
[OK] nvidia-peermem NOT loaded (using DMA-BUF instead)

==========================================
NCCL Environment Variables
==========================================
Current NCCL settings from environment:
  NCCL_DEBUG=INFO
  NCCL_IB_DISABLE=0
  NCCL_IB_TC=104
  NCCL_NET_GDR_LEVEL=SYS
  NCCL_P2P_LEVEL=NVL

[OK] NCCL variables configured in /etc/profile.d/nccl-rdma.sh

==========================================
PyTorch NCCL Check
==========================================
Testing NCCL availability in PyTorch...
  NCCL available: True
  NCCL backend can be used for distributed training
[OK] PyTorch NCCL backend available

==========================================
Results
==========================================
OK: 8  WARN: 0  FAIL: 0

Test RDMA (network only):
  # Server: ib_write_bw -d mlx5_0
  # Client: ib_write_bw -d mlx5_0 <server-ip>

Test GPUDirect with NCCL (single node, 2+ GPUs):
  source /opt/pytorch-venv/bin/activate
  torchrun --nproc_per_node=2 /usr/local/bin/test-nccl

Test GPUDirect with NCCL (multi-node):
  # Node 0: torchrun --nproc_per_node=<gpus> --nnodes=2 --node_rank=0 \
  #           --master_addr=<master_ip> --master_port=29500 /usr/local/bin/test-nccl
  # Node 1: torchrun --nproc_per_node=<gpus> --nnodes=2 --node_rank=1 \
  #           --master_addr=<master_ip> --master_port=29500 /usr/local/bin/test-nccl

Look for: 'DMA-BUF is available', 'Using network IB', 'GDR 1'
```

**Interpreting results**:
- DMA-BUF support requires three components: nvidia-open driver, kernel P2PDMA support, kernel 6.2+
- Legacy nvidia-peermem should NOT be loaded when using DMA-BUF
- NCCL environment variables should be set with correct values for lossless RoCE

#### Troubleshooting

1. **GPUDirect Verification Fails**

    - **Symptom**: `verify-gpudirect` shows nvidia-open driver not detected or P2PDMA not enabled.
    - **Check**:
      ```bash
      # Check nvidia-open driver installation
      dpkg -l | grep nvidia-driver | grep open

      # Check kernel P2PDMA support
      grep CONFIG_PCI_P2PDMA /boot/config-$(uname -r)

      # Check kernel version
      uname -r
      ```
    - **Solution**:
      - If proprietary driver installed: `apt remove nvidia-driver-570 && apt install nvidia-driver-570-open`
      - If P2PDMA disabled: Upgrade to Ubuntu 24.04 with kernel 6.8+ (default config has P2PDMA enabled)
      - If kernel < 6.2: Upgrade kernel to 6.2+ for full DMA-BUF support

----

### test-nccl

**Purpose**: End-to-end verification of NCCL communication for single-server or multi-server distributed training.

**When to use**: Final verification after all previous checks pass. Tests actual multi-GPU communication.

**What it checks**:
- NCCL initialization and process group creation
- GPU-to-GPU communication (single-server via NVLink/PCIe, multi-server via RDMA)
- GPUDirect RDMA usage (for multi-server)
- all_reduce collective operation correctness

**Hardware dependencies**:
- Single-server: 2+ GPUs on same host
- Multi-server: Mellanox NIC with RoCE on all servers, proper network connectivity between servers

#### How to run

Single-server (requires 2+ GPUs):

```bash
source /opt/pytorch-venv/bin/activate
torchrun --nproc_per_node=2 /usr/local/bin/test-nccl
```

Multi-server (2 servers, each with N GPUs):

```bash
# On server 0 (master):
source /opt/pytorch-venv/bin/activate
torchrun --nproc_per_node=8 --nnodes=2 --node_rank=0 \
  --master_addr=10.0.0.10 --master_port=29500 /usr/local/bin/test-nccl

# On server 1:
source /opt/pytorch-venv/bin/activate
torchrun --nproc_per_node=8 --nnodes=2 --node_rank=1 \
  --master_addr=10.0.0.10 --master_port=29500 /usr/local/bin/test-nccl
```

**Expected output** (single-server, 2 GPUs, with NCCL_DEBUG=INFO):

The actual output will be verbose with many NCCL INFO lines about initialization, topology, channels, and rings. Below are the **key lines to look for** in that output:

```
[NCCL] DMA-BUF is available
[NCCL] Using network IB:mlx5_0:1
[NCCL] NET/IB: Using addr=10.0.0.10 port=48221 dev=mlx5_0
[NCCL] GDR 1
Rank 0: OK (result=1.0, expected=1.0)
Rank 1: OK (result=1.0, expected=1.0)
```

**Expected output** (multi-server, 2 servers x 2 GPUs, with NCCL_DEBUG=INFO):

Again, the actual output will include 50+ NCCL INFO lines. Below are the **key indicators** to look for:

```
[NCCL] DMA-BUF is available
[NCCL] Using network IB:mlx5_0:1
[NCCL] NET/IB: Using addr=10.0.0.10 port=48221 dev=mlx5_0
[NCCL] GDR 1
Rank 0: OK (result=6.0, expected=6.0)
Rank 1: OK (result=6.0, expected=6.0)
Rank 2: OK (result=6.0, expected=6.0)
Rank 3: OK (result=6.0, expected=6.0)
```

**Interpreting results**:

NCCL will output details about bootstrap, CUDA version, comm config, topology, channels, rings, and timings. You can safely ignore most of this. Focus on these **key indicators** in the verbose output:

- `DMA-BUF is available` - GPU memory export working correctly
- `Using network IB` - RDMA/RoCE is being used (not TCP fallback)
- `GDR 1` - GPUDirect RDMA is enabled (appears per-GPU during initialization)
- `Rank N: OK (result=X, expected=X)` - all_reduce operation succeeded

If you see `Using network Socket` instead of `Using network IB`, NCCL has fallen back to TCP. Check RDMA configuration with `verify-rdma`.

#### Troubleshooting

1. **NCCL Test Hangs or Fails**

    - **Symptom**: `test-nccl` hangs during initialization or fails with NCCL errors.
    - **Check**:
      ```bash
      # Check NCCL environment variables are set
      source /opt/pytorch-venv/bin/activate
      env | grep NCCL

      # Run with verbose debug output
      NCCL_DEBUG=TRACE torchrun --nproc_per_node=2 /usr/local/bin/test-nccl

      # For multi-server, check network connectivity
      ping <other-server-ip>

      # Check firewall rules
      iptables -L -n
      ```
    - **Solution**:
      - If NCCL vars not set: `source /etc/profile.d/nccl-rdma.sh` before running
      - If hangs at init: Check network connectivity, firewall rules (NCCL needs TCP ports for bootstrap)
      - If "no NCCL devices found": Re-run `verify-gpudirect` to check GPUDirect setup
      - Multi-server hangs: Verify both servers can reach master_addr on master_port

2. **RDMA Not Being Used (TCP Fallback)**

    - **Symptom**: NCCL debug output shows `Using network Socket` instead of `Using network IB`.
    - **Check**:
      ```bash
      # Verify RDMA devices visible
      ibv_devinfo

      # Check RDMA links active
      rdma link show

      # Check NCCL not disabling IB
      echo $NCCL_IB_DISABLE
      # Should be "0" or unset
      ```
    - **Solution**:
      - If no RDMA devices: Run `verify-rdma` to diagnose RDMA stack issues
      - If `NCCL_IB_DISABLE=1`: Unset or set to 0 in environment
      - If RDMA devices exist but NCCL doesn't use them: Check `NCCL_DEBUG=INFO` for errors like "IB device not usable"

----

## RDMA and GPUDirect Deep Dive

### When Do You Need RDMA?

RDMA (Remote Direct Memory Access) is **required for multi-server distributed training** and not needed for single-server workloads.

**Multi-server training** (RDMA required):
- NCCL uses GPUDirect RDMA for server-to-server GPU communication
- Required for distributed training (DDP, FSDP, DeepSpeed) across multiple servers
- Network path: GPU → NIC → network → NIC → GPU

**Single-server training** (RDMA not used):
- NCCL uses GPUDirect P2P for GPU-to-GPU communication within the server
- NVLink (preferred) or PCIe for intra-server GPU communication
- Your server works fine for single-server training without RDMA verification

**Inference workloads** (RDMA not needed):
- Model serving, inference, single-GPU training

### RoCE Configuration Details

RoCE (RDMA over Converged Ethernet) requires lossless Ethernet to prevent packet drops during congestion. This is achieved via Priority Flow Control (PFC) on a specific traffic class.

**Traffic class mapping**:
- ToS 104 = DSCP 26 = TC3 (typical configuration)
- DSCP 26 is AF31 (Assured Forwarding 31), a standard marking for high-priority data

**Configuration locations**:
- RDMA-CM ToS: `/sys/kernel/config/rdma_cm/*/ports/1/default_roce_tos` (set to 104)
- NCCL ToS: `NCCL_IB_TC=104` in `/etc/profile.d/nccl-rdma.sh`
- Service: `rdma-cm-tos.service` applies ToS on boot

**Verification**:

```bash
# Check rdma-cm-tos service
systemctl status rdma-cm-tos

# Check RDMA-CM ToS setting
cat /sys/kernel/config/rdma_cm/mlx5_0/ports/1/default_roce_tos
# Should output: 104

# Check NCCL configuration
grep NCCL_IB_TC /etc/profile.d/nccl-rdma.sh
# Should output: export NCCL_IB_TC=104
```

## FAQ

**How do I activate the PyTorch environment?**

```bash
source /opt/pytorch-venv/bin/activate
```

All verification scripts that need PyTorch will activate the environment automatically, but for interactive Python work you need to source it yourself.

**Can I skip RDMA verification for single-server training?**

Yes. RDMA verification is intendend for multi-server distributed training. For single-server workloads (including multi-GPU on one server), you only need GPU verification (`nvidia-smi` and PyTorch CUDA check). NCCL uses GPUDirect P2P with NVLink or PCIe for intra-server GPU communication.

**What's the difference between verify-rdma and verify-gpudirect?**

- `verify-rdma`: Checks RDMA network stack (kernel modules, RDMA devices, QoS config). Verifies NIC-side configuration.
- `verify-gpudirect`: Checks GPUDirect RDMA setup (DMA-BUF support, nvidia-open driver, GPU-NIC integration). Verifies GPU-side configuration.

Both are needed for complete GPUDirect RDMA verification. Run `verify-rdma` first, then `verify-gpudirect`.

**How do I confirm RDMA is actually being used during training?**

Look for these indicators in NCCL debug output (set `NCCL_DEBUG=INFO`):
- `Using network IB:mlx5_0` - RDMA device in use
- `GDR 1` - GPUDirect RDMA enabled

If you see `Using network Socket`, NCCL has fallen back to TCP. Check RDMA configuration with `verify-rdma`.

**How do I configure NCCL environment variables for my workload?**

NCCL variables are pre-configured in `/etc/profile.d/nccl-rdma.sh` and loaded automatically in login shells. For non-interactive scripts or containers, source the file explicitly:

```bash
source /etc/profile.d/nccl-rdma.sh
```

Common NCCL variables you might override:
- `NCCL_DEBUG=INFO` - Enable debug output (use `TRACE` for verbose debugging)
- `NCCL_NET_GDR_LEVEL=SYS` - GPUDirect RDMA threshold (default: always use)
- `NCCL_IB_TC=104` - Traffic class for RoCE (must match switch config)
- `NCCL_IB_TIMEOUT=22` - Increase if you see timeout errors on slow networks

