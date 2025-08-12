import React, { useState } from "react";
import { Project as ProjectType } from "../constants/index";

interface ProjectProps {
  title: string;
  description: string;
  subDescription: string[];
  href: string;
  image: string;
  tags: ProjectType["tags"];
  setPreview: (image: string | null) => void;
}

const Project: React.FC<ProjectProps> = ({
  title,
  description,
  subDescription,
  href,
  image,
  tags,
  setPreview,
}) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  
  return (
    <>
      <div
        className="flex-wrap items-center justify-between py-10 space-y-14 sm:flex sm:space-y-0"
        onMouseEnter={() => setPreview(image)}
        onMouseLeave={() => setPreview(null)}
      >
        <div>
          <p className="text-2xl">{title}</p>
          <div className="flex gap-5 mt-2 text-sand">
            {tags.map((tag) => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsHidden(true)}
          className="flex items-center gap-1 cursor-pointer hover-animation"
        >
          Read More
          <img src="assets/arrow-right.svg" className="w-5" alt="arrow right" />
        </button>
      </div>
      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent h-[1px] w-full" />
      {isHidden && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button
                  onClick={() => setIsHidden(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <img src={image} alt={title} className="w-full h-48 object-cover rounded mb-4" />
              <p className="text-gray-600 mb-4">{description}</p>
              {subDescription && (
                <div className="space-y-2 mb-4">
                  {subDescription.map((desc, index) => (
                    <p key={index} className="text-sm text-gray-500">{desc}</p>
                  ))}
                </div>
              )}
              {tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-200 rounded text-sm">{String(tag)}</span>
                  ))}
                </div>
              )}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ver Projeto
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Project;