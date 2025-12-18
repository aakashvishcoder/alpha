import React, { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import { Rnd } from 'react-rnd';

const GraphingCalculator = () => {
    /*
        For now, just adding the expressions and table (might combine into one later)
    */
    const [expressions, setExpressions] = useState([
        { id: 1, latex: 'y = x^2', color: '#00f7ff'},
        { id: 2, latex: 'y = sin(x)', color: '#ff2a6d'},
    ]);
    const [newLatex, setNewLatex] = useState('');
    const [activePanel, setActivePanel] = useState('expressions');

    const plotRef = useRef();

    // function to parse the input into a function (will change A LOT)
    const parseExpression = (latex) => {
        const clean = latex
            .replace(/\s+/g, '')
            .replace(/y=/i, '')
            .replace(/\^/g,'**')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/pi/g,'Math.PI')
            .replace(/e/g, 'Math.e');

        return clean;
    };

    // convert the expressions into plot
    const generateData = () => {
        const x= [];
        const yValues = [];

        // calculate the point with a given x range and step value (finite for now)
        for (let i = -10; i <= 10; i += 0.1) {
            x.push(i);
        }

        expressions.forEach((expression) => {
            try {
                const functionString = parseExpression(expression.latex);
                const y = x.map((value) => {
                    try {
                        return eval(functionString.replace(/x/g, value));
                    } catch {
                        return NaN;
                    }
                });
                yValues.push({
                    x,
                    y,
                    type: 'scatter',
                    line: { color: expression.color, width: 2.5 },
                    name: expression.latex,
                });
            } catch (err) {
                console.error("Expression cannot be parsed:", expression.latex);
            }
        });
        return yValues;
    };

    const addExpression = () => {
        if (!newLatex.trim()) return;
        const newExpression = {
            id: Date.now(),
            latex: newLatex.trim(),
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        };
        setExpressions([...expressions, newExpression]);
        setNewLatex('');
    };

    const removeExpression = (id) => {
        setExpressions(expressions.filter((e) => e.id !== id));
    };

    // making the plot layout
    const layout = {
        paper_bgcolor: '#0f0c08',
        plot_bgcolor: '#0f0c08',
        font: {
            family: "'Bodoni Moda', serif",
            size: 14,
            color: 'white',
        },
        xaxis: {
            range: [-10,10], // base range
            color: '#00f7ff',
            showgrid: true,
            gridcolor: 'rgba(0, 247, 255, 0.1)',
            zeroline: true,
            zerolinecolor: '#00f7ff',
        },
        yaxis: {
            range: [-10, 10], // base range
            color: '#00f7ff',
            showgrid: true,
            gridcolor: 'rgba(0, 247, 255, 0.1)',
            zeroline: true,
            zerolinecolor: '#00f7ff',
        },
        dragmode: 'pan', // handles moving the graph around
        hovermode: 'closest', // hovering into and out of the graph
    };

    return (
        <div className="min-h-screen bg-dark text-white font-serif p-4 flex flex-col">
            <div className="flex-1 flex">
                {/* Table Panel (movable) */}
                <Rnd
                    default={{
                        x: 20,
                        y: 80,
                        width: 300,
                        height: 400,
                    }}
                    minWidth={250}
                    minHeight={300}
                    bounds="parent"
                    className="z-10"
                >
                    <div className="bg-card rounded shadow-lg h-full flex flex-col">
                        <div className="flex border-b border-gray-700">
                            <button
                                onClick={() => setActivePanel('expressions')}
                                className={`flex-1 py-2 text-center font-medium ${
                                    activePanel === 'expressions'
                                        ? 'bg-cream text-black'
                                        : 'bg-card text-gray-300'
                                }`}
                            >
                                Expressions
                            </button>
                            <button
                                onClick={() => setActivePanel('table')}
                                className={`flex-1 py-2 text-center font-medium ${
                                    activePanel === 'table' ? 'bg-cream text-black' : 'bg-card text-gray-300'
                                }`}
                            >
                                Table
                            </button>
                        </div>

                        {activePanel === 'expressions' && (
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {expressions.map((expression) => (
                                    <div key={expression.id} className="flex items-center gap-2">
                                        <div
                                            className='w-4 h-4 rounded-full'
                                            style={{ backgroundColor: expression.color }}
                                        ></div>
                                        <input 
                                            type="text"
                                            value={expression.latex}
                                            onChange={(e) => 
                                                setExpressions(
                                                    expressions.map((exp) => 
                                                        exp.id === expression.id ? {...exp, latex: e.target.value } : exp
                                                    )
                                                )
                                            }
                                            className='flex-1 bg-gray-900 text-white px-2 py-1 rounded text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-neonBlue'
                                        />
                                        <button
                                            onClick={() => removeExpression(expression.id)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2 mt-4">
                                    <input
                                        type="text"
                                        value={newLatex}
                                        onChange={(e) => setNewLatex(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addExpression()}
                                        placeholder='y = ...'
                                        className="flex-1 bg-gray-900 text-white px-2 py-1 rounded text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-neonBlue"
                                    />
                                    <button
                                        onClick={addExpression}
                                        className="px-3 py-1 bg-neonBlue text-black rounded font-bold hover:opacity-90"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {activePanel === 'table' && (
                            // will add the table inpyut here
                            <div className="p-3 text-gray-400 text-sm">
                                Table input
                                <br />
                                <span className="text-xs">Add x,y components and plot points!</span>
                            </div>
                        )}
                    </div>
                </Rnd>

                <div className="flex-1 ml-4">
                    <Plot
                        data={generateData()}
                        layout={layout}
                        config={{
                            displayModeBar: false,
                            scrollZoom: true,
                        }}
                        style={{ width: '100%', height:'100%'}}
                        useResizeHandler={true}
                    />
                </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-2">
                Type equations like: <code className="bg-gray-900 px-1 rounded">y = x^2</code>{' '}
                <code className="bg-gray-900 px-1 rounded">y = sin(x)</code>
                <code className="bg-gray-900 px-1 rounded">y = 2x + 1</code>
            </div>
        </div>
    );
};

export default GraphingCalculator;