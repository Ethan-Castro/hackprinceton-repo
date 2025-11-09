import PptxGenJS from 'pptxgenjs';

export interface PowerPointExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  theme?: 'default' | 'blue' | 'green' | 'modern';
}

export interface PowerPointContent {
  title: string;
  subtitle?: string;
  slides: Array<{
    title: string;
    content: string | string[];
    type?: 'title' | 'content' | 'two-column';
    notes?: string;
  }>;
}

const THEMES = {
  default: {
    primaryColor: '4285F4',
    secondaryColor: 'EA4335',
    backgroundColor: 'FFFFFF',
  },
  blue: {
    primaryColor: '1F77D2',
    secondaryColor: '4299E1',
    backgroundColor: 'F7FAFC',
  },
  green: {
    primaryColor: '2F855A',
    secondaryColor: '38A169',
    backgroundColor: 'F0FFF4',
  },
  modern: {
    primaryColor: '667EEA',
    secondaryColor: '764BA2',
    backgroundColor: 'FAFBFC',
  },
};

export async function generatePowerPoint(
  content: PowerPointContent,
  options: PowerPointExportOptions = {}
): Promise<Buffer> {
  const {
    title = 'Presentation',
    author = 'Augment',
    subject = 'Generated Presentation',
    theme = 'default',
  } = options;

  const prs = new PptxGenJS();
  prs.defineLayout({ name: 'LAYOUT1', width: 10, height: 7.5 });
  prs.defineLayout({ name: 'LAYOUT2', width: 10, height: 7.5 });

  const themeColors = THEMES[theme];

  // Set theme
  prs.theme = {
    name: theme,
    colors: [
      themeColors.primaryColor,
      themeColors.secondaryColor,
      themeColors.backgroundColor,
    ],
  };

  // Title slide
  const titleSlide = prs.addSlide();
  titleSlide.background = { color: themeColors.primaryColor };

  titleSlide.addText(content.title, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 54,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });

  if (content.subtitle) {
    titleSlide.addText(content.subtitle, {
      x: 0.5,
      y: 4.2,
      w: 9,
      h: 0.8,
      fontSize: 28,
      color: 'FFFFFF',
      align: 'center',
    });
  }

  titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 0.5,
    y: 6.5,
    w: 9,
    h: 0.5,
    fontSize: 12,
    color: 'E8EAED',
    align: 'center',
  });

  // Content slides
  for (const slideData of content.slides) {
    const slide = prs.addSlide();
    slide.background = { color: themeColors.backgroundColor };

    // Add header line
    slide.addShape(prs.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.08,
      fill: { color: themeColors.primaryColor },
      line: { type: 'none' },
    });

    // Title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 40,
      bold: true,
      color: themeColors.primaryColor,
    });

    // Content
    const contentArray = Array.isArray(slideData.content)
      ? slideData.content
      : [slideData.content];

    if (slideData.type === 'two-column' && contentArray.length >= 2) {
      // Two-column layout
      slide.addText(contentArray[0], {
        x: 0.5,
        y: 1.1,
        w: 4.5,
        h: 5.8,
        fontSize: 14,
        color: '222222',
        valign: 'top',
      });

      slide.addText(contentArray[1], {
        x: 5.2,
        y: 1.1,
        w: 4.3,
        h: 5.8,
        fontSize: 14,
        color: '222222',
        valign: 'top',
      });
    } else {
      // Single column
      const bulletText = contentArray
        .map((line) => ({
          text: line,
          options: { fontSize: 14, color: '222222' },
        }))
        .slice(0, 8); // Limit to 8 bullets

      slide.addText(bulletText, {
        x: 0.8,
        y: 1.2,
        w: 8.4,
        h: 5.6,
        fontSize: 14,
        color: '222222',
        bullet: true,
        valign: 'top',
      });
    }

    // Footer
    slide.addText(`Page ${prs.slides.length - 1}`, {
      x: 0.5,
      y: 7,
      w: 9,
      h: 0.3,
      fontSize: 10,
      color: themeColors.secondaryColor,
      align: 'right',
    });
  }

  // Get buffer
  const buffer = await prs.writeFile({ outputType: 'arraybuffer' });
  return Buffer.from(buffer as ArrayBuffer);
}

export async function downloadPowerPoint(
  content: PowerPointContent,
  filename: string = 'presentation.pptx',
  options?: PowerPointExportOptions
) {
  const pptx = await generatePowerPoint(content, options);
  const blob = new Blob([pptx], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
