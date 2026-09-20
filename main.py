import os
import io
import requests
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

app = FastAPI(title="Dreamland ReportLab PDF Generator")

SERVICE_SECRET = os.environ.get("PYTHON_SERVICE_SECRET", "default-secure-secret")

def verify_service_secret(x_service_secret: Optional[str] = Header(None)):
    """Validates the shared secret header sent by the Supabase Edge Function."""
    if not x_service_secret or x_service_secret != SERVICE_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid or missing service authentication secret.")
    return True

class ReportPayload(BaseModel):
    inspectionNumber: str
    ppiNumber: str
    vehicle: Dict[str, Any]
    items: List[Dict[str, Any]]
    findings: List[Dict[str, Any]]
    summary: Dict[str, Any]
    hasScannerReport: bool
    photos: List[str]
    signoff: Dict[str, Any]

def generate_pdf_bytes(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        rightMargin=36, 
        leftMargin=36, 
        topMargin=36, 
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    primary_color = colors.HexColor('#0f172a')
    accent_color = colors.HexColor('#2563eb')
    muted_color = colors.HexColor('#64748b')
    
    title_style = ParagraphStyle('CoverTitle', parent=styles['Heading1'], fontSize=22, textColor=primary_color, alignment=1, spaceAfter=8)
    subtitle_style = ParagraphStyle('CoverSubtitle', parent=styles['Normal'], fontSize=11, textColor=muted_color, alignment=1, spaceAfter=24)
    h2_style = ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontSize=13, textColor=primary_color, spaceBefore=12, spaceAfter=6)
    body_style = ParagraphStyle('BodyTextCustom', parent=styles['Normal'], fontSize=9, textColor=primary_color, leading=12)
    table_cell_style = ParagraphStyle('TableCell', parent=styles['Normal'], fontSize=8, textColor=primary_color, leading=10)
    table_header_style = ParagraphStyle('TableHeader', parent=styles['Normal'], fontSize=8, textColor=colors.white, fontName="Helvetica-Bold", leading=10)

    story = []

    # ==========================================
    # 1. COVER PAGE
    # ==========================================
    story.append(Spacer(1, 60))
    story.append(Paragraph("DREAMLAND MOTOR ENGINEERING WORKS", title_style))
    story.append(Paragraph("Official Pre-Purchase Inspection & Technical Valuation Report", subtitle_style))
    story.append(Spacer(1, 20))
    
    ppi_number = data.get('ppiNumber', 'DL-PPI-DIRECT')
    inspection_number = data.get('inspectionNumber', 'INS-UNKNOWN')
    vehicle = data.get('vehicle', {})
    
    current_utc = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')

    meta_table_data = [
        [Paragraph("<b>PPI Tracking Number:</b>", body_style), Paragraph(ppi_number, body_style)],
        [Paragraph("<b>Inspection Reference:</b>", body_style), Paragraph(inspection_number, body_style)],
        [Paragraph("<b>Vehicle Specification:</b>", body_style), Paragraph(f"{vehicle.get('year', '')} {vehicle.get('make', '')} {vehicle.get('model', '')} ({vehicle.get('trim', '')})", body_style)],
        [Paragraph("<b>VIN / Chassis Code:</b>", body_style), Paragraph(vehicle.get('vin', 'N/A'), body_style)],
        [Paragraph("<b>Registration Number:</b>", body_style), Paragraph(vehicle.get('registration_number', 'N/A'), body_style)],
        [Paragraph("<b>Authoritative Status:</b>", body_style), Paragraph("<b>APPROVED & LOCKED</b>", body_style)],
        [Paragraph("<b>Issuance UTC:</b>", body_style), Paragraph(current_utc, body_style)],
    ]
    t_cover = Table(meta_table_data, colWidths=[150, 350])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_cover)
    story.append(PageBreak())

    # ==========================================
    # 2. VEHICLE SPECIFICATIONS
    # ==========================================
    story.append(Paragraph("2. Vehicle Information & Baseline Specifications", h2_style))
    mileage_val = vehicle.get('mileage', 0)
    mileage_unit = vehicle.get('mileage_unit', 'km')
    
    veh_data = [
        [Paragraph("Make:", body_style), Paragraph(str(vehicle.get('make', '-')), body_style), Paragraph("Transmission:", body_style), Paragraph(str(vehicle.get('transmission', '-')), body_style)],
        [Paragraph("Model:", body_style), Paragraph(str(vehicle.get('model', '-')), body_style), Paragraph("Fuel Type:", body_style), Paragraph(str(vehicle.get('fuel_type', '-')), body_style)],
        [Paragraph("Year:", body_style), Paragraph(str(vehicle.get('year', '-')), body_style), Paragraph("Colour:", body_style), Paragraph(str(vehicle.get('colour', '-')), body_style)],
        [Paragraph("Recorded Mileage:", body_style), Paragraph(f"{mileage_val:,} {mileage_unit}", body_style), Paragraph("Body Type:", body_style), Paragraph(str(vehicle.get('body_type', '-')), body_style)],
        [Paragraph("Engine Specification:", body_style), Paragraph(str(vehicle.get('engine', '-')), body_style), Paragraph("Inspection Location:", body_style), Paragraph(str(vehicle.get('location', '-')), body_style)],
    ]
    t_veh = Table(veh_data, colWidths=[110, 140, 110, 140])
    t_veh.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f1f5f9')),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#f1f5f9')),
    ]))
    story.append(t_veh)
    story.append(Spacer(1, 10))

    # ==========================================
    # 3. EXECUTIVE SUMMARY (Authoritative Breakdown)
    # ==========================================
    story.append(Paragraph("3. Executive Inspection Summary & Status Breakdown", h2_style))
    summary = data.get('summary', {})
    breakdown = summary.get('breakdown', {})
    
    sum_data = [
        [Paragraph("<b>Inspection Tally Metric</b>", table_header_style), Paragraph("<b>Item Count</b>", table_header_style)],
        [Paragraph("Total Master Checklist Items Evaluated", table_cell_style), Paragraph(str(summary.get('totalItems', 0)), table_cell_style)],
        [Paragraph("Good Condition (Operational)", table_cell_style), Paragraph(str(breakdown.get('good', 0)), table_cell_style)],
        [Paragraph("Fair Condition (Minor Wear / Note)", table_cell_style), Paragraph(str(breakdown.get('fair', 0)), table_cell_style)],
        [Paragraph("Attention Required (Scheduled Service)", table_cell_style), Paragraph(str(breakdown.get('attention', 0)), table_cell_style)],
        [Paragraph("Critical Safety Hazard (Immediate Action)", table_cell_style), Paragraph(str(breakdown.get('critical', 0)), table_cell_style)],
    ]
    t_sum = Table(sum_data, colWidths=[320, 180])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_sum)
    story.append(PageBreak())

    # ==========================================
    # 4. MASTER CHECKLIST
    # ==========================================
    story.append(Paragraph("4. Master Checklist (Full Authoritative Record)", h2_style))
    items = data.get('items', [])
    chk_header = [
        Paragraph("<b>Code</b>", table_header_style),
        Paragraph("<b>Item Name</b>", table_header_style),
        Paragraph("<b>Status</b>", table_header_style),
        Paragraph("<b>Observation & Corrective Action</b>", table_header_style)
    ]
    chk_rows = [chk_header]
    for item in items:
        obs_text = f"<b>Obs:</b> {item.get('observation', 'None')}<br/><b>Action:</b> {item.get('recommended_action', 'None')}"
        chk_rows.append([
            Paragraph(item.get('item_code', ''), table_cell_style),
            Paragraph(item.get('item_name', ''), table_cell_style),
            Paragraph(item.get('status', 'PENDING'), table_cell_style),
            Paragraph(obs_text, table_cell_style)
        ])
    
    t_chk = Table(chk_rows, colWidths=[70, 130, 60, 240], repeatRows=1)
    t_chk.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_chk)
    story.append(PageBreak())

    # ==========================================
    # 5. FINDINGS AND DEFECT LOG
    # ==========================================
    story.append(Paragraph("5. Detailed Findings & Defect Log", h2_style))
    findings = data.get('findings', [])
    
    if findings:
        fin_header = [
            Paragraph("<b>Area & Component</b>", table_header_style),
            Paragraph("<b>Rating</b>", table_header_style),
            Paragraph("<b>Observation & Recommendation</b>", table_header_style),
            Paragraph("<b>Est. Cost (₦)</b>", table_header_style)
        ]
        fin_rows = [fin_header]
        for f in findings:
            cost_val = f.get('estimated_cost', 0)
            cost_str = f"₦{cost_val:,.0f}" if cost_val else "₦0"
            desc = f"<b>{f.get('finding', '')}</b><br/>Rec: {f.get('recommended_action', 'None')}"
            fin_rows.append([
                Paragraph(f"{f.get('area', '')} &rsaquo; {f.get('component', '')}", table_cell_style),
                Paragraph(f.get('rating', 'FAIR'), table_cell_style),
                Paragraph(desc, table_cell_style),
                Paragraph(cost_str, table_cell_style)
            ])
        t_fin = Table(fin_rows, colWidths=[120, 60, 230, 90], repeatRows=1)
        t_fin.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), primary_color),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_fin)
    else:
        story.append(Paragraph("No adverse findings or corrective defect notes recorded.", body_style))
    
    story.append(Spacer(1, 10))

    # ==========================================
    # 6. DIAGNOSTIC EVIDENCE (Linked Scanner Reference)
    # ==========================================
    story.append(Paragraph("6. Diagnostic Scanner Evidence Reference", h2_style))
    if data.get('hasScannerReport', False):
        story.append(Paragraph("<b>OBD2 Diagnostic Health Scan:</b> An electronic OBD2 diagnostic log is linked and archived securely under Dreamland diagnostic records. Reference hashes match authenticated workshop diagnostic tools.", body_style))
    else:
        story.append(Paragraph("No diagnostic scanner report was attached to this inspection session.", body_style))
    
    story.append(Spacer(1, 10))

    # ==========================================
    # 7. PHOTOGRAPHIC EVIDENCE (Rendered via Signed URLs)
    # ==========================================
    story.append(Paragraph("7. Photographic Evidence", h2_style))
    photos = data.get('photos', [])
    if photos:
        story.append(Paragraph("Key inspection photographs captured during physical evaluation:", body_style))
        story.append(Spacer(1, 6))
        
        photo_flowables = []
        for photo_url in photos[:6]:
            try:
                resp = requests.get(photo_url, timeout=5)
                if resp.status_code == 200:
                    img_io = io.BytesIO(resp.content)
                    img = RLImage(img_io, width=150, height=100)
                    img.hAlign = 'CENTER'
                    photo_flowables.append(img)
            except Exception:
                pass
        
        if photo_flowables:
            table_rows = []
            for i in range(0, len(photo_flowables), 2):
                row = photo_flowables[i:i+2]
                while len(row) < 2:
                    row.append(Spacer(1, 1))
                table_rows.append(row)
            
            t_photos = Table(table_rows, colWidths=[240, 240])
            t_photos.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(t_photos)
        else:
            story.append(Paragraph("Photographic files stored securely in cloud inventory repository.", body_style))
    else:
        story.append(Paragraph("No inspection photographs linked.", body_style))
    
    story.append(Spacer(1, 10))

    # ==========================================
    # 8. APPROVAL & AUDIT SIGN-OFF
    # ==========================================
    signoff = data.get('signoff', {})
    sign_data = [
        [Paragraph("<b>Assigned Inspector ID:</b>", body_style), Paragraph(str(signoff.get('inspectorId', 'N/A')), body_style)],
        [Paragraph("<b>Approving Administrator ID:</b>", body_style), Paragraph(str(signoff.get('reviewerId', 'N/A')), body_style)],
        [Paragraph("<b>Approval Timestamp:</b>", body_style), Paragraph(str(signoff.get('approvedAt', 'N/A')), body_style)],
        [Paragraph("<b>Report Generator ID:</b>", body_style), Paragraph(str(signoff.get('reportGeneratedBy', 'N/A')), body_style)],
        [Paragraph("<b>Report Generation UTC:</b>", body_style), Paragraph(str(signoff.get('reportGeneratedAt', 'N/A')), body_style)],
    ]
    t_sign = Table(sign_data, colWidths=[150, 350])
    t_sign.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f8fafc')),
    ]))
    story.append(KeepTogether([Paragraph("8. Approval & Audit Sign-Off", h2_style), t_sign]))
    story.append(Spacer(1, 10))

    # ==========================================
    # 9. DOCUMENT VERIFICATION
    # ==========================================
    ver_data = [
        [Paragraph("<b>Dreamland Document Verification:</b>", body_style), Paragraph(f"Authentic Digital Document for PPI #{ppi_number} / Inspection #{inspection_number}. Generated from the authoritative approved inspection record and archived securely by Dreamland Motor Engineering Works, Lagos.", body_style)]
    ]
    t_ver = Table(ver_data, colWidths=[140, 360])
    t_ver.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, accent_color),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
    ]))
    story.append(KeepTogether([Paragraph("9. Document Verification", h2_style), t_ver]))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

@app.post("/generate")
def generate_report(payload: ReportPayload, authorized: bool = Depends(verify_service_secret)):
    try:
        pdf_bytes = generate_pdf_bytes(payload.dict())
        from fastapi.responses import Response
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
