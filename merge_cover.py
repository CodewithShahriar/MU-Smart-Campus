import os
import sys

cover_path = r"C:\Users\Abid\.gemini\antigravity-ide\brain\828d6286-3f22-4478-9e73-2db8a307f146\.user_uploaded\media_1790403758184.pdf"
report_path = r"d:\Projects\MU Smart Campus\output\pdf\MU_Smart_Campus_Project_Report.pdf"
output_path = r"d:\Projects\MU Smart Campus\output\pdf\MU_Smart_Campus_Project_Report.pdf"
temp_output = r"d:\Projects\MU Smart Campus\output\pdf\MU_Smart_Campus_Project_Report_Merged.pdf"

print(f"Cover exists: {os.path.exists(cover_path)}")
print(f"Report exists: {os.path.exists(report_path)}")

merged = False

# Try pypdf / PyPDF2
try:
    import pypdf
    merger = pypdf.PdfMerger()
    merger.append(cover_path)
    merger.append(report_path)
    merger.write(temp_output)
    merger.close()
    merged = True
    print("Merged using pypdf")
except Exception as e:
    print("pypdf error:", e)

if not merged:
    try:
        import PyPDF2
        merger = PyPDF2.PdfMerger()
        merger.append(cover_path)
        merger.append(report_path)
        merger.write(temp_output)
        merger.close()
        merged = True
        print("Merged using PyPDF2")
    except Exception as e:
        print("PyPDF2 error:", e)

if not merged:
    try:
        import fitz  # PyMuPDF
        doc_cover = fitz.open(cover_path)
        doc_report = fitz.open(report_path)
        doc_cover.insert_pdf(doc_report)
        doc_cover.save(temp_output)
        merged = True
        print("Merged using PyMuPDF (fitz)")
    except Exception as e:
        print("fitz error:", e)

if merged and os.path.exists(temp_output):
    import shutil
    shutil.move(temp_output, output_path)
    print(f"Successfully replaced {output_path} with merged cover page! File size: {os.path.getsize(output_path)} bytes")
else:
    print("Failed to merge with standard libraries.")
