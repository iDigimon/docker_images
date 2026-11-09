# docker_images

## 目录结构

- `python/` 包含各版本的 Python Dockerfile、依赖清单和本地构建脚本。
- `alpine/`、`golang/`、`redis/`、`ubuntu/` 存放各自的镜像文件，CUDA 版本放在 `ubuntu/`。
- `node/`、`nginx/`、`postgres/` 保留已停用同步的镜像定义。
- `.github/workflows/` 存放 GitHub Actions 配置。

本地构建脚本可从仓库根目录调用，例如 `bash python/build-python.sh`。

## alpine

基础运行镜像，安装了最新的更新包和时区，避免每次从头安装。

## golang

注意，此镜像是golang的打包镜像，不是运行镜像，golang运行不需要依赖其他库。
