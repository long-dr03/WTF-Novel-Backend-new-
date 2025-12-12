# HTML to Word Converter Tool

Tool Python chuyển đổi các file HTML từ truyện web sang định dạng Word (.docx)

## Cài đặt

### 1. Cài đặt Python
Đảm bảo bạn đã cài đặt Python 3.8 trở lên.

### 2. Cài đặt thư viện cần thiết

```bash
pip install -r requirements_converter.txt
```

Hoặc cài đặt thủ công:

```bash
pip install python-docx beautifulsoup4 lxml
```

## Sử dụng

### Cách 1: Chuyển tất cả file HTML trong thư mục thành 1 file Word

```bash
python html_to_word_converter.py -i "example - content" -o "truyen.docx"
```

### Cách 2: Chuyển từng file HTML thành file Word riêng biệt

```bash
python html_to_word_converter.py -i "example - content" --separate
```

### Cách 3: Chuyển một file HTML cụ thể

```bash
python html_to_word_converter.py -i "example - content/chuong-001.html" -o "chuong-001.docx"
```

### Cách 4: Tùy chỉnh định dạng

```bash
python html_to_word_converter.py -i "example - content" -o "truyen.docx" \
    --font "Arial" \
    --font-size 14 \
    --chapter-font-size 18 \
    --line-spacing 1.8 \
    --margin 3.0
```

## Các tùy chọn

| Tùy chọn | Mô tả | Mặc định |
|----------|-------|----------|
| `-i, --input` | Đường dẫn file HTML hoặc thư mục | (bắt buộc) |
| `-o, --output` | Đường dẫn file Word đầu ra | Tự động tạo |
| `--separate` | Chuyển từng file riêng biệt | False |
| `--font` | Tên font chữ | Times New Roman |
| `--font-size` | Cỡ chữ nội dung (pt) | 13 |
| `--chapter-font-size` | Cỡ chữ tiêu đề chương (pt) | 16 |
| `--line-spacing` | Khoảng cách dòng | 1.5 |
| `--margin` | Lề trang (cm) | 2.54 |
| `--pattern` | Pattern để match file HTML | *.html |

## Sử dụng trong Python code

```python
from html_to_word_converter import HTMLToWordConverter

# Tạo converter
converter = HTMLToWordConverter(
    font_name="Times New Roman",
    font_size=13,
    chapter_font_size=16,
    line_spacing=1.5,
    page_margin=2.54
)

# Chuyển một file
converter.convert_single_file("chuong-001.html", "chuong-001.docx")

# Chuyển tất cả file trong thư mục thành 1 file Word
converter.convert_folder(
    "example - content",
    "truyen.docx",
    combine=True
)

# Chuyển từng file riêng biệt
converter.convert_folder(
    "example - content",
    "output_folder",
    combine=False
)
```

## Cấu trúc HTML được hỗ trợ

Tool này hỗ trợ cấu trúc HTML như sau:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <title>Tiêu đề chương</title>
</head>
<body>
    <h1>Tiêu đề chương</h1>
    <div id="content-chapter">
        <p>Đoạn văn 1</p>
        <p>Đoạn văn 2</p>
        ...
    </div>
</body>
</html>
```

## Lưu ý

- Các file HTML sẽ được sắp xếp theo số trong tên file (ví dụ: chuong-001.html, chuong-002.html)
- Mỗi chương sẽ bắt đầu ở trang mới
- Tiêu đề chương sẽ được căn giữa và in đậm
- Nội dung sẽ được căn đều 2 bên với thụt đầu dòng
