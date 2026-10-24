import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PrerequisiteGraphView({ nodes = [], edges = [], onSelectNode, selectedNodeId, highlightPath = [] }) {
  const { lang } = useApp();
  const [filterClass, setFilterClass] = useState('all');

  const classColors = {
    6: {
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      text: 'text-sky-900',
      badge: 'bg-sky-100 text-sky-800 border-sky-300',
      accent: 'border-sky-500'
    },
    7: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      accent: 'border-amber-500'
    },
    8: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-900',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      accent: 'border-purple-500'
    }
  };

  const filteredNodes = filterClass === 'all'
    ? nodes
    : nodes.filter(n => n.class === parseInt(filterClass));

  const groupedByClass = {
    6: nodes.filter(n => n.class === 6),
    7: nodes.filter(n => n.class === 7),
    8: nodes.filter(n => n.class === 8),
  };

  const getIncomingPrereqs = (nodeId) => {
    return edges.filter(([p, d]) => d === nodeId).map(([p]) => p);
  };

  const getOutgoingDeps = (nodeId) => {
    return edges.filter(([p, d]) => p === nodeId).map(([_, d]) => d);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>NCERT / CBSE Prerequisite Continuity Ladder</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {nodes.length} Competency Nodes • {edges.length} Dependency Vectors
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates cross-grade continuity: Click any concept to trace foundational dependencies backwards.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Filter Grade:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setFilterClass('all')}
              className={`px-2.5 py-1 font-semibold rounded-md transition ${filterClass === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All (6–8)
            </button>
            <button
              onClick={() => setFilterClass('6')}
              className={`px-2 py-1 font-semibold rounded-md transition ${filterClass === '6' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Class 6
            </button>
            <button
              onClick={() => setFilterClass('7')}
              className={`px-2 py-1 font-semibold rounded-md transition ${filterClass === '7' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Class 7
            </button>
            <button
              onClick={() => setFilterClass('8')}
              className={`px-2 py-1 font-semibold rounded-md transition ${filterClass === '8' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Class 8
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Visual Ladder (Class 6 -> Class 7 -> Class 8) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[6, 7, 8].map((grade) => {
          if (filterClass !== 'all' && filterClass !== String(grade)) return null;

          const gradeNodes = groupedByClass[grade] || [];
          const colors = classColors[grade];

          return (
            <div key={grade} className={`rounded-xl border ${colors.border} ${colors.bg} p-3.5 flex flex-col`}>
              {/* Column Grade Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${colors.badge}`}>
                    Grade {grade}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {grade === 6 ? 'Foundational Anchor' : grade === 7 ? 'Transitional Bridge' : 'Secondary Prep'}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {gradeNodes.length} Topics
                </span>
              </div>

              {/* Node Cards */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-1">
                {gradeNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isHighlighted = highlightPath.includes(node.id);
                  const incoming = getIncomingPrereqs(node.id);
                  const outgoing = getOutgoingDeps(node.id);

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode && onSelectNode(node)}
                      className={`cursor-pointer rounded-lg p-2.5 transition border text-left bg-white relative ${
                        isSelected
                          ? `ring-2 ring-emerald-500 border-emerald-500 shadow-md`
                          : isHighlighted
                          ? `border-rose-400 bg-rose-50/50 shadow-sm ring-1 ring-rose-300`
                          : `border-slate-200 hover:border-slate-300 hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-xs text-slate-900 leading-tight">
                          {node.label}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 ml-1 shrink-0">
                          Ch {node.chapter}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {node.description}
                      </p>

                      {/* Dependency Tags */}
                      <div className="flex items-center space-x-2 mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                        <span title={`Requires ${incoming.length} prior concept(s)`}>
                          ⬅ {incoming.length} prereq{incoming.length === 1 ? '' : 's'}
                        </span>
                        <span>•</span>
                        <span title={`Unlocks ${outgoing.length} subsequent concept(s)`}>
                          ➡ unlocks {outgoing.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
