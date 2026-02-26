// @ts-nocheck
import { DataType } from '../types/data-bus'
import {
  NodeTypeId,
  NodeCategory,
  type NodeTypeDefinition,
} from '../types/node-types'

/**
 * Central registry of all available node type definitions.
 * Used by the validator, canvas, and palette.
 */
export const NODE_TYPE_REGISTRY: Map<NodeTypeId, NodeTypeDefinition> = new Map([
  [
    NodeTypeId.PdfInput,
    {
      id: NodeTypeId.PdfInput,
      label: 'PDF Input',
      description: 'Load one or more PDF files into the pipeline.',
      category: NodeCategory.IO,
      icon: 'FileInput',
      color: '#3b82f6',
      inputs: [],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {},
      maxInstances: 1,
    },
  ],
  [
    NodeTypeId.PdfOutput,
    {
      id: NodeTypeId.PdfOutput,
      label: 'PDF Output',
      description: 'Download or package the final output files.',
      category: NodeCategory.IO,
      icon: 'FileOutput',
      color: '#3b82f6',
      inputs: [
        { id: 'files-in', label: 'Files', dataType: DataType.Files, required: true },
      ],
      outputs: [],
      defaultConfig: {
        packaging: 'individual',
        zipFilename: 'output.zip',
        namingPattern: '{original}-output',
      },
      maxInstances: 1,
    },
  ],
  [
    NodeTypeId.SplitPdf,
    {
      id: NodeTypeId.SplitPdf,
      label: 'Split PDF',
      description: 'Split a PDF into individual pages or page ranges.',
      category: NodeCategory.Transform,
      icon: 'Scissors',
      color: '#8b5cf6',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: { mode: 'all', pageRange: '' },
    },
  ],
  [
    NodeTypeId.MergePdf,
    {
      id: NodeTypeId.MergePdf,
      label: 'Merge PDF',
      description: 'Combine multiple PDFs into a single document.',
      category: NodeCategory.Transform,
      icon: 'Merge',
      color: '#8b5cf6',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {},
    },
  ],
  [
    NodeTypeId.ExtractText,
    {
      id: NodeTypeId.ExtractText,
      label: 'Extract Text',
      description: 'Extract text content from a PDF.',
      category: NodeCategory.Convert,
      icon: 'FileText',
      color: '#10b981',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'text-out', label: 'Text', dataType: DataType.Text, required: true },
      ],
      defaultConfig: { outputFormat: 'txt' },
    },
  ],
  [
    NodeTypeId.PdfToImage,
    {
      id: NodeTypeId.PdfToImage,
      label: 'PDF to Image',
      description: 'Convert PDF pages to images.',
      category: NodeCategory.Convert,
      icon: 'Image',
      color: '#10b981',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'images-out', label: 'Images', dataType: DataType.Images, required: true },
      ],
      defaultConfig: { dpi: 150, format: 'png', jpgQuality: 85 },
    },
  ],
  [
    NodeTypeId.ImageToPdf,
    {
      id: NodeTypeId.ImageToPdf,
      label: 'Image to PDF',
      description: 'Convert images into a PDF document.',
      category: NodeCategory.Convert,
      icon: 'FileImage',
      color: '#10b981',
      inputs: [
        { id: 'images-in', label: 'Images', dataType: DataType.Images, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {
        pagePreset: 'a4',
        orientation: 'portrait',
        marginPreset: 'normal',
        layoutMode: 'one-per-page',
        backgroundColor: '#ffffff',
      },
    },
  ],
  [
    NodeTypeId.MarkdownToPdf,
    {
      id: NodeTypeId.MarkdownToPdf,
      label: 'Markdown to PDF',
      description: 'Convert Markdown text into a styled PDF.',
      category: NodeCategory.Convert,
      icon: 'FileCode',
      color: '#10b981',
      inputs: [],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {
        pageFormat: 'a4',
        theme: 'light',
        markdownContent: '',
      },
    },
  ],
  [
    NodeTypeId.CompressPdf,
    {
      id: NodeTypeId.CompressPdf,
      label: 'Compress PDF',
      description: 'Reduce the file size of a PDF.',
      category: NodeCategory.Transform,
      icon: 'Minimize2',
      color: '#8b5cf6',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: { profile: 'recommended' },
    },
  ],
  [
    NodeTypeId.WatermarkPdf,
    {
      id: NodeTypeId.WatermarkPdf,
      label: 'Watermark PDF',
      description: 'Add a text watermark to every page.',
      category: NodeCategory.Transform,
      icon: 'Droplets',
      color: '#8b5cf6',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {
        text: 'DRAFT',
        fontSize: 48,
        opacity: 0.3,
        color: '#888888',
        rotation: -45,
      },
    },
  ],
  [
    NodeTypeId.PageNumbers,
    {
      id: NodeTypeId.PageNumbers,
      label: 'Page Numbers',
      description: 'Add page numbers to each page of a PDF.',
      category: NodeCategory.Transform,
      icon: 'Hash',
      color: '#8b5cf6',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {
        position: 'bottom-center',
        format: 'numeric',
        fontSize: 12,
        margin: 30,
      },
    },
  ],
  [
    NodeTypeId.ProtectPdf,
    {
      id: NodeTypeId.ProtectPdf,
      label: 'Protect PDF',
      description: 'Add password protection and set permissions.',
      category: NodeCategory.Transform,
      icon: 'Lock',
      color: '#8b5cf6',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {
        userPassword: '',
        ownerPassword: '',
        permissions: {
          printing: true,
          modifying: false,
          copying: false,
          annotating: false,
        },
      },
    },
  ],
  [
    NodeTypeId.Filter,
    {
      id: NodeTypeId.Filter,
      label: 'Filter',
      description: 'Filter files by name, size, or page count.',
      category: NodeCategory.Helper,
      icon: 'Filter',
      color: '#f59e0b',
      inputs: [
        { id: 'pdf-in', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      outputs: [
        { id: 'pdf-out', label: 'PDF', dataType: DataType.Pdf, required: true },
      ],
      defaultConfig: {
        filenamePattern: '',
        minFileSize: null,
        maxFileSize: null,
        minPageCount: null,
        maxPageCount: null,
      },
    },
  ],
  [
    NodeTypeId.Rename,
    {
      id: NodeTypeId.Rename,
      label: 'Rename',
      description: 'Rename output files using a pattern.',
      category: NodeCategory.Helper,
      icon: 'PencilLine',
      color: '#f59e0b',
      inputs: [
        { id: 'files-in', label: 'Files', dataType: DataType.Files, required: true },
      ],
      outputs: [
        { id: 'files-out', label: 'Files', dataType: DataType.Files, required: true },
      ],
      defaultConfig: { pattern: '{original}-renamed' },
    },
  ],
])
