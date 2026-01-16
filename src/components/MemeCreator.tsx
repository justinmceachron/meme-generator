"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { db } from "@/lib/instant";
import { id } from "@instantdb/react";

// Meme templates from imgflip
const memeTemplates = [
  { name: "Drake", url: "https://i.imgflip.com/30b1gx.jpg" },
  { name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { name: "Expanding Brain", url: "https://i.imgflip.com/1jhljt.jpg" },
  { name: "Woman Yelling at Cat", url: "https://i.imgflip.com/345v97.jpg" },
  { name: "This is Fine", url: "https://i.imgflip.com/26am.jpg" },
  { name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { name: "Running Away", url: "https://i.imgflip.com/261o3j.jpg" },
  { name: "Success Kid", url: "https://i.imgflip.com/1bhk.jpg" },
  { name: "Surprised Pikachu", url: "https://i.imgflip.com/2kbn1e.jpg" },
  { name: "Doge", url: "https://i.imgflip.com/4t0m5.jpg" },
  { name: "Hide the Pain Harold", url: "https://i.imgflip.com/gk5el.jpg" },
  { name: "Disaster Girl", url: "https://i.imgflip.com/23ls.jpg" },
  { name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg" },
  { name: "Left Exit 12", url: "https://i.imgflip.com/22bdq6.jpg" },
  { name: "Is This a Pigeon", url: "https://i.imgflip.com/1o00in.jpg" },
  { name: "One Does Not Simply", url: "https://i.imgflip.com/1bh8.jpg" },
];

interface Textbox {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  rotation: number;
}

interface MemeCreatorProps {
  userId: string;
  userEmail: string;
  onMemePosted?: () => void;
}

export default function MemeCreator({ userId, userEmail, onMemePosted }: MemeCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [textboxes, setTextboxes] = useState<Textbox[]>([]);
  const [textboxIdCounter, setTextboxIdCounter] = useState(0);
  const [selectedTextbox, setSelectedTextbox] = useState<Textbox | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Drag state
  const [draggedTextbox, setDraggedTextbox] = useState<Textbox | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Resize state
  const [resizingTextbox, setResizingTextbox] = useState<Textbox | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  // Rotation state
  const [rotatingTextbox, setRotatingTextbox] = useState<Textbox | null>(null);
  const [rotationStart, setRotationStart] = useState(0);
  
  // Text formatting
  const [fontColor, setFontColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Impact, Arial Black, sans-serif");
  
  // Canvas display dimensions
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  
  // Posting state
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState("");

  // Load image from URL or file
  const loadImage = useCallback((source: string | File) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      setCurrentImage(img);
      setTextboxes([]);

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Limit canvas size for display
      const maxWidth = 700;
      const maxHeight = 500;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight = displayHeight * ratio;
      }

      if (displayHeight > maxHeight) {
        const ratio = maxHeight / displayHeight;
        displayHeight = maxHeight;
        displayWidth = displayWidth * ratio;
      }

      setDisplayDimensions({ width: displayWidth, height: displayHeight });
    };

    img.onerror = () => {
      alert("Failed to load image. Please try another image.");
    };

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  }, []);

  // Render meme on canvas
  useEffect(() => {
    if (!currentImage || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(currentImage, 0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [currentImage]);

  // Select template
  const selectTemplate = (url: string) => {
    setSelectedTemplate(url);
    loadImage(url);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedTemplate(null);
      loadImage(e.target.files[0]);
    }
  };

  // Create textbox
  const createTextbox = (x: number, y: number) => {
    const newTextbox: Textbox = {
      id: textboxIdCounter,
      x,
      y,
      width: 200,
      height: 60,
      text: "Text",
      color: fontColor,
      fontSize,
      fontFamily,
      rotation: 0,
    };
    setTextboxIdCounter((prev) => prev + 1);
    setTextboxes((prev) => [...prev, newTextbox]);
    setSelectedTextbox(newTextbox);
  };

  // Delete textbox
  const deleteTextbox = (textboxId: number) => {
    setTextboxes((prev) => prev.filter((tb) => tb.id !== textboxId));
    if (selectedTextbox?.id === textboxId) {
      setSelectedTextbox(null);
    }
  };

  // Update textbox
  const updateTextbox = (textboxId: number, updates: Partial<Textbox>) => {
    setTextboxes((prev) =>
      prev.map((tb) => (tb.id === textboxId ? { ...tb, ...updates } : tb))
    );
    if (selectedTextbox?.id === textboxId) {
      setSelectedTextbox((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentImage) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createTextbox(x, y);
  };

  // Start dragging
  const startDrag = (e: React.MouseEvent, textbox: Textbox) => {
    e.stopPropagation();
    setDraggedTextbox(textbox);
    setDragStart({ x: e.clientX - textbox.x, y: e.clientY - textbox.y });
    setSelectedTextbox(textbox);
    
    // Update controls to match selected textbox
    setFontColor(textbox.color);
    setFontSize(textbox.fontSize);
    setFontFamily(textbox.fontFamily);
  };

  // Start resizing
  const startResize = (e: React.MouseEvent, textbox: Textbox, handle: string) => {
    e.stopPropagation();
    setResizingTextbox(textbox);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Start rotating
  const startRotation = (e: React.MouseEvent, textbox: Textbox) => {
    e.stopPropagation();
    setRotatingTextbox(textbox);
    
    // Calculate the center of the textbox
    const centerX = textbox.x + textbox.width / 2;
    const centerY = textbox.y + textbox.height / 2;
    
    // Get container position
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    // Calculate initial angle from center to mouse
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const initialAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    setRotationStart(initialAngle - textbox.rotation);
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedTextbox) {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, displayDimensions.width - draggedTextbox.width));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, displayDimensions.height - draggedTextbox.height));
        updateTextbox(draggedTextbox.id, { x: newX, y: newY });
      }

      if (resizingTextbox && resizeHandle) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const minWidth = 100;
        const minHeight = 40;

        const updates: Partial<Textbox> = {};

        if (resizeHandle === "se") {
          updates.width = Math.max(minWidth, resizingTextbox.width + deltaX);
          updates.height = Math.max(minHeight, resizingTextbox.height + deltaY);
        } else if (resizeHandle === "sw") {
          const newWidth = Math.max(minWidth, resizingTextbox.width - deltaX);
          updates.x = resizingTextbox.x + (resizingTextbox.width - newWidth);
          updates.width = newWidth;
          updates.height = Math.max(minHeight, resizingTextbox.height + deltaY);
        } else if (resizeHandle === "ne") {
          updates.width = Math.max(minWidth, resizingTextbox.width + deltaX);
          const newHeight = Math.max(minHeight, resizingTextbox.height - deltaY);
          updates.y = resizingTextbox.y + (resizingTextbox.height - newHeight);
          updates.height = newHeight;
        } else if (resizeHandle === "nw") {
          const newWidth = Math.max(minWidth, resizingTextbox.width - deltaX);
          const newHeight = Math.max(minHeight, resizingTextbox.height - deltaY);
          updates.x = resizingTextbox.x + (resizingTextbox.width - newWidth);
          updates.y = resizingTextbox.y + (resizingTextbox.height - newHeight);
          updates.width = newWidth;
          updates.height = newHeight;
        }

        setDragStart({ x: e.clientX, y: e.clientY });
        updateTextbox(resizingTextbox.id, updates);
        setResizingTextbox({ ...resizingTextbox, ...updates });
      }

      // Handle rotation
      if (rotatingTextbox) {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        
        // Calculate the center of the textbox
        const centerX = rotatingTextbox.x + rotatingTextbox.width / 2;
        const centerY = rotatingTextbox.y + rotatingTextbox.height / 2;
        
        // Calculate current angle from center to mouse
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
        
        // Calculate new rotation
        let newRotation = currentAngle - rotationStart;
        
        // Snap to 0, 90, 180, 270 if close (within 5 degrees)
        const snapAngles = [0, 90, 180, 270, -90, -180, -270];
        for (const snapAngle of snapAngles) {
          if (Math.abs(newRotation - snapAngle) < 5) {
            newRotation = snapAngle;
            break;
          }
        }
        
        updateTextbox(rotatingTextbox.id, { rotation: newRotation });
        setRotatingTextbox({ ...rotatingTextbox, rotation: newRotation });
      }
    };

    const handleMouseUp = () => {
      setDraggedTextbox(null);
      setResizingTextbox(null);
      setResizeHandle(null);
      setRotatingTextbox(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedTextbox, resizingTextbox, resizeHandle, dragStart, displayDimensions, rotatingTextbox, rotationStart]);

  // Apply formatting to selected textbox
  useEffect(() => {
    if (selectedTextbox) {
      updateTextbox(selectedTextbox.id, {
        color: fontColor,
        fontSize,
        fontFamily,
      });
    }
  }, [fontColor, fontSize, fontFamily]);

  // Generate final meme image
  const generateMemeImage = (): string | null => {
    if (!currentImage || !canvasRef.current) return null;

    const downloadCanvas = document.createElement("canvas");
    const downloadCtx = downloadCanvas.getContext("2d");
    if (!downloadCtx) return null;

    downloadCanvas.width = currentImage.width;
    downloadCanvas.height = currentImage.height;

    // Draw image
    downloadCtx.drawImage(currentImage, 0, 0);

    // Calculate scale factor
    const scaleX = canvasRef.current.width / displayDimensions.width;
    const scaleY = canvasRef.current.height / displayDimensions.height;

    // Draw textboxes
    textboxes.forEach((textbox) => {
      const scaledX = textbox.x * scaleX;
      const scaledY = textbox.y * scaleY;
      const scaledWidth = textbox.width * scaleX;
      const scaledHeight = textbox.height * scaleY;
      const scaledFontSize = textbox.fontSize * Math.min(scaleX, scaleY);
      const rotation = textbox.rotation || 0;

      // Calculate center point for rotation
      const centerX = scaledX + scaledWidth / 2;
      const centerY = scaledY + scaledHeight / 2;

      // Save context state
      downloadCtx.save();

      // Move to center, rotate, then draw from center
      downloadCtx.translate(centerX, centerY);
      downloadCtx.rotate((rotation * Math.PI) / 180);

      // Draw text with stroke and fill (at center, which is now 0,0)
      downloadCtx.fillStyle = textbox.color;
      downloadCtx.strokeStyle = "#000000";
      downloadCtx.lineWidth = Math.max(2, scaledFontSize / 15);
      downloadCtx.lineJoin = "round";
      downloadCtx.textAlign = "center";
      downloadCtx.textBaseline = "middle";
      downloadCtx.font = `bold ${scaledFontSize}px ${textbox.fontFamily}`;

      downloadCtx.strokeText(textbox.text, 0, 0);
      downloadCtx.fillText(textbox.text, 0, 0);

      // Restore context state
      downloadCtx.restore();
    });

    return downloadCanvas.toDataURL("image/png", 0.8);
  };

  // Download meme
  const handleDownload = () => {
    const dataUrl = generateMemeImage();
    if (!dataUrl) return;

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "meme.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Post meme to InstantDB
  const handlePost = async () => {
    if (!currentImage) return;
    
    setIsPosting(true);
    setPostError("");

    try {
      const dataUrl = generateMemeImage();
      if (!dataUrl) {
        throw new Error("Failed to generate meme image");
      }

      // Check image size (base64 is ~33% larger than binary)
      // Limit to ~400KB base64 which is ~300KB actual image
      if (dataUrl.length > 400000) {
        throw new Error("Image is too large. Please use a smaller image or fewer text boxes.");
      }

      // Get text content for the meme
      const topText = textboxes.length > 0 ? textboxes[0].text : "";
      const bottomText = textboxes.length > 1 ? textboxes[1].text : "";

      await db.transact(
        db.tx.memes[id()].update({
          imageBase64: dataUrl,
          topText,
          bottomText,
          authorId: userId,
          authorEmail: userEmail,
          createdAt: Date.now(),
        })
      );

      onMemePosted?.();
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to post meme");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar - Templates */}
      <div className="lg:w-72 bg-[#1e1e1e] rounded-xl p-4 overflow-y-auto max-h-[300px] lg:max-h-none">
        <h2 className="text-lg font-semibold text-primary mb-4">Meme Templates</h2>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {memeTemplates.map((template) => (
            <div
              key={template.name}
              onClick={() => selectTemplate(template.url)}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedTemplate === template.url
                  ? "border-primary shadow-lg shadow-primary/30"
                  : "border-transparent hover:border-primary/50"
              }`}
            >
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-24 lg:h-32 object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 text-center">
                {template.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-[#2a2a2a] rounded-xl overflow-hidden">
        {/* Upload Area */}
        <div className="bg-[#1e1e1e] p-4 border-b border-[#333]">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary rounded-lg p-4 text-center cursor-pointer hover:bg-[#333] transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-primary font-semibold">Upload Your Own Image</span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-6 relative overflow-auto">
          <div ref={containerRef} className="relative inline-block">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{
                width: displayDimensions.width || "auto",
                height: displayDimensions.height || "auto",
                cursor: currentImage ? "crosshair" : "default",
              }}
              className="border-2 border-[#444] rounded-lg bg-white shadow-xl"
            />
            
            {/* Textbox Overlays */}
            {textboxes.map((textbox) => {
              const isSelected = selectedTextbox?.id === textbox.id;
              return (
                <div
                  key={textbox.id}
                  className={`absolute border-2 border-dashed cursor-move ${
                    isSelected
                      ? "border-primary-dark shadow-lg shadow-primary/30"
                      : "border-primary"
                  }`}
                  style={{
                    left: textbox.x,
                    top: textbox.y,
                    width: textbox.width,
                    height: textbox.height,
                    backgroundColor: "rgba(255, 107, 53, 0.1)",
                    // Apply rotation transform
                    transform: `rotate(${textbox.rotation || 0}deg)`,
                    transformOrigin: "center center",
                  }}
                  onMouseDown={(e) => startDrag(e, textbox)}
                >
                <textarea
                  value={textbox.text}
                  onChange={(e) => updateTextbox(textbox.id, { text: e.target.value })}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTextbox(textbox);
                    setFontColor(textbox.color);
                    setFontSize(textbox.fontSize);
                    setFontFamily(textbox.fontFamily);
                  }}
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-center font-bold"
                  style={{
                    color: textbox.color,
                    fontSize: textbox.fontSize,
                    fontFamily: textbox.fontFamily,
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8)",
                  }}
                />
                
                {/* Close button - only show when selected */}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTextbox(textbox.id);
                    }}
                    className="absolute -top-4 -right-4 w-7 h-7 bg-red-500 border-2 border-white rounded-full text-white hover:bg-red-600 transition-colors z-10 flex items-center justify-center"
                    style={{ 
                      lineHeight: 1,
                      transform: `rotate(${-(textbox.rotation || 0)}deg)`,
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Resize handles - only show when selected */}
                {isSelected && (
                  <>
                    {/* Resize handles */}
                    <div
                      onMouseDown={(e) => startResize(e, textbox, "nw")}
                      className="absolute w-3 h-3 bg-primary border-2 border-white rounded-full"
                      style={{ 
                        top: -6, 
                        left: -6, 
                        cursor: "nw-resize",
                        transform: `rotate(${-(textbox.rotation || 0)}deg)`,
                      }}
                    />
                    <div
                      onMouseDown={(e) => startResize(e, textbox, "ne")}
                      className="absolute w-3 h-3 bg-primary border-2 border-white rounded-full"
                      style={{ 
                        top: -6, 
                        right: -6, 
                        cursor: "ne-resize",
                        transform: `rotate(${-(textbox.rotation || 0)}deg)`,
                      }}
                    />
                    <div
                      onMouseDown={(e) => startResize(e, textbox, "se")}
                      className="absolute w-3 h-3 bg-primary border-2 border-white rounded-full"
                      style={{ 
                        bottom: -6, 
                        right: -6, 
                        cursor: "se-resize",
                        transform: `rotate(${-(textbox.rotation || 0)}deg)`,
                      }}
                    />
                    <div
                      onMouseDown={(e) => startResize(e, textbox, "sw")}
                      className="absolute w-3 h-3 bg-primary border-2 border-white rounded-full"
                      style={{ 
                        bottom: -6, 
                        left: -6, 
                        cursor: "sw-resize",
                        transform: `rotate(${-(textbox.rotation || 0)}deg)`,
                      }}
                    />
                    
                    {/* Rotate handle (bottom-left) */}
                    <div
                      onMouseDown={(e) => startRotation(e, textbox)}
                      className="absolute w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center"
                      style={{ 
                        bottom: -10, 
                        left: -10, 
                        cursor: "grab",
                        transform: `rotate(${-(textbox.rotation || 0)}deg)`,
                      }}
                      title="Rotate"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            );
            })}
          </div>

          {!currentImage && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Select a template or upload an image to get started
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="bg-[#252525] p-4 border-t border-[#333]">
          <div className="flex flex-wrap gap-4 justify-center items-center mb-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Color:</label>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-10 h-8 border-none rounded cursor-pointer"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Size:</label>
              <input
                type="range"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-24 accent-primary"
              />
              <input
                type="number"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 32)}
                className="w-14 px-2 py-1 bg-[#333] border border-[#444] rounded text-white text-center text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Font:</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="px-2 py-1 bg-[#333] border border-[#444] rounded text-white text-sm min-w-[130px]"
              >
                <option value="Impact, Arial Black, sans-serif">Impact</option>
                <option value="Arial Black, sans-serif">Arial Black</option>
                <option value="Comic Sans MS, cursive">Comic Sans</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier New, monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
              </select>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm mb-4">
            Click on the meme to add text | Drag to move | Resize from corners | Click X to delete
          </div>

          {postError && (
            <div className="text-red-400 text-sm text-center mb-4">{postError}</div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownload}
              disabled={!currentImage}
              className="px-6 py-3 bg-[#333] text-white font-semibold rounded-full hover:bg-[#444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download
            </button>
            <button
              onClick={handlePost}
              disabled={!currentImage || isPosting}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? "Posting..." : "Post Meme"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
