import React, { useRef, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { FiCircle, FiSquare, FiTriangle, FiType, FiUpload, FiEdit3, FiBrush } from 'react-icons/fi';
import { FaUndo, FaPaintBrush } from "react-icons/fa";

const Canvas = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [background, setBackground] = useState('#f0f0f0');
    const [brushColor, setBrushColor] = useState('blue'); // Set default color


    useEffect(() => {
        const newCanvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 550,
            backgroundColor: background
        });

        setCanvas(newCanvas);
        addToHistory(newCanvas);

        return () => {
            newCanvas.dispose();
        };
    }, []);

    useEffect(() => {
        if (canvas) {
            canvas.selection = true; // Enable object selection
        }
    }, [canvas]);

    const addToHistory = (c) => {
        const newHistory = [...history.slice(0, historyIndex + 1), c.toJSON()];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newHistoryIndex = historyIndex - 1;
            setHistoryIndex(newHistoryIndex);
            const canvasData = history[newHistoryIndex];
            canvas.loadFromJSON(canvasData, () => {
                setBackground(canvas.backgroundColor);
                canvas.renderAll.bind(canvas);
            });
        }
    };

    const handleShape = (shapeType) => {
        let shape;

        switch (shapeType) {
            case 'circle':
                shape = new fabric.Circle({ radius: 50, fill: 'transparent', stroke: 'red', left: 100, top: 100 });
                break;
            case 'rectangle':
                shape = new fabric.Rect({ width: 100, height: 100, fill: 'transparent', stroke: 'green', left: 200, top: 100 });
                break;
            case 'triangle':
                shape = new fabric.Triangle({ width: 100, height: 100, fill: 'transparent', stroke: 'blue', left: 300, top: 100 });
                break;
            default:
                break;
        }

        if (canvas) {
            canvas.add(shape);
            addToHistory(canvas);
        }
    };

    const handleText = () => {
        if (canvas) {
            const text = new fabric.IText('Type here', {
                left: 100,
                top: 100,
                fontFamily: 'Arial',
                fill: 'black',
                fontSize: 20
            });
            canvas.add(text);
            addToHistory(canvas);
        }
    };

    const handleClearCanvas = () => {
        if (canvas) {
            canvas.clear();
            addToHistory(canvas);
        }
    };

    const handleSaveCanvas = () => {
        if (canvas) {
            const dataURL = canvas.toDataURL({ format: 'png' });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'canvas.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleImageUpload = (e) => {
        if (canvas) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const fabricImage = new fabric.Image(img);
                    canvas.add(fabricImage);
                    addToHistory(canvas);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    const handlePencil = () => {
        if (canvas) {
            canvas.isDrawingMode = !canvas.isDrawingMode;
            canvas.freeDrawingBrush.color = 'black';
            canvas.freeDrawingBrush.width = 2;
        }
    };

    const handleBrush = () => {
        if (canvas) {
            canvas.isDrawingMode = !canvas.isDrawingMode;
            canvas.freeDrawingBrush.color = brushColor;
            canvas.freeDrawingBrush.width = 10;
        }
    };
    const handleColorChange = (color) => {
        setBrushColor(color);
        if (canvas) {
            canvas.freeDrawingBrush.color = color;
        }
    };

    return (
        <div className="canvas-container">
            <div className="toolbar">
                <button onClick={handlePencil}><FiEdit3 /></button>
                <button onClick={handleBrush}><FaPaintBrush /></button>
                <input type="color" value={brushColor} onChange={(e) => handleColorChange(e.target.value)} />
                <button onClick={() => handleShape('circle')}><FiCircle /></button>
                <button onClick={() => handleShape('rectangle')}><FiSquare /></button>
                <button onClick={() => handleShape('triangle')}><FiTriangle /></button>
                <button onClick={handleText}><FiType /></button>
                <button onClick={handleUndo}><FaUndo /></button>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="upload" />
                <button> <label htmlFor="upload"><FiUpload />Upload</label></button>
                <button onClick={handleClearCanvas}>Clear</button>
                <button onClick={handleSaveCanvas}>Save</button>
                <canvas ref={canvasRef} className="canvas" />
            </div>
        </div>
    );
};

export default Canvas;
