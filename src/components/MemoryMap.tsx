"use client";

import { useMemo, useState } from "react";
import type { Capsule } from "@/types";
import CapsulePreview from "./CapsulePreview";

interface MemoryMapProps {
  capsules: Capsule[];
  currentAge: number;
  onCapsuleClick: (capsule: Capsule) => void;
}

interface Node {
  capsule: Capsule;
  x: number;
  y: number;
  label: string;
}

const POSITIVE_LIGHT = "#c9a96e";
const NEUTRAL_LIGHT = "#8a7e6e";
const LOCKED_LIGHT = "#5a4a3a";

function dotColor(capsule: Capsule): string {
  if (capsule.isLocked) return LOCKED_LIGHT;
  const tag = capsule.sentimentTag;
  if (tag === "#grateful" || tag === "#proud" || tag === "#hopeful") return POSITIVE_LIGHT;
  return NEUTRAL_LIGHT;
}

function distributeNodes(
  capsules: Capsule[],
  width: number,
  height: number
): Node[] {
  const count = capsules.length;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;

  return capsules.map((capsule, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const label =
      capsule.title.length > 20
        ? capsule.title.slice(0, 18) + "…"
        : capsule.title;
    return { capsule, x, y, label };
  });
}

export default function MemoryMap({ capsules, currentAge, onCapsuleClick }: MemoryMapProps) {
  const [previewCapsule, setPreviewCapsule] = useState<Capsule | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const size = { width: 600, height: 400 };

  const nodes = useMemo(
    () => distributeNodes(Array.isArray(capsules) ? capsules : [], size.width, size.height),
    [capsules]
  );

  return (
    <>
      <div className="bg-surface rounded-xl border border-border p-6 paper-texture">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif text-foreground">Your Memory Map</h2>
            <span className="text-xs text-muted font-serif italic">
              {currentAge} years old
            </span>
          </div>

          <svg
            viewBox={`0 0 ${size.width} ${size.height}`}
            className="w-full h-auto"
          >
            <defs>
              <filter id="star-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="star-glow-selected">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {nodes.map((node, i) => {
              const color = dotColor(node.capsule);
              const isSelected = selectedId === node.capsule.id;
              const isLocked = node.capsule.isLocked;

              return (
                <g key={node.capsule.id}>
                  {(i > 0 || nodes.length > 1) && (
                    <line
                      x1={nodes[0].x}
                      y1={nodes[0].y}
                      x2={node.x}
                      y2={node.y}
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                      opacity="0.35"
                    />
                  )}

                  {/* Glow ring behind the dot */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={10}
                      fill="none"
                      stroke={color}
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  )}

                  {/* Main tiny dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 4.5 : 3.5}
                    fill={color}
                    opacity={isLocked ? 0.4 : 0.85}
                    className="cursor-pointer"
                    style={{
                      filter: `url(#${isSelected ? "star-glow-selected" : "star-glow"})`,
                      animation: !isLocked
                        ? `star-pulse ${3 + (i % 3) * 0.5}s ease-in-out infinite`
                        : "none",
                      animationDelay: `${i * 0.4}s`,
                      transition: "r 0.3s, opacity 0.3s",
                    }}
                    onClick={() => {
                      setSelectedId(node.capsule.id);
                      setPreviewCapsule(node.capsule);
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.setAttribute("r", isSelected ? "5.5" : "4.5");
                      el.setAttribute("opacity", "1");
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.setAttribute("r", isSelected ? "4.5" : "3.5");
                      el.setAttribute("opacity", isLocked ? "0.4" : "0.85");
                    }}
                  />

                  {/* Label below */}
                  <text
                    x={node.x}
                    y={node.y + 18}
                    textAnchor="middle"
                    fill="var(--muted)"
                    fontSize="8"
                    fontFamily="Georgia, serif"
                    className="pointer-events-none select-none"
                    opacity={isSelected ? 0.9 : 0.6}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}

            {nodes.length === 0 && (
              <text
                x={size.width / 2}
                y={size.height / 2}
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="13"
                fontFamily="Georgia, serif"
                fontStyle="italic"
              >
                Your map is empty — write your first letter
              </text>
            )}
          </svg>
        </div>
      </div>

      {previewCapsule && (
        <CapsulePreview
          capsule={previewCapsule}
          onClose={() => {
            setPreviewCapsule(null);
            setSelectedId(null);
          }}
          onOpen={() => {
            setPreviewCapsule(null);
            setSelectedId(null);
            onCapsuleClick(previewCapsule);
          }}
        />
      )}
    </>
  );
}
