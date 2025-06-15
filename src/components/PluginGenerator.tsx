'use client';

import { useState, useEffect } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { PluginForm } from './PluginForm';
import { LoadingState } from './LoadingState';
import { ResultsSection } from './ResultsSection';
import { ChatSection } from './ChatSection';
import { ProjectSection } from './ProjectSection';
import { Footer } from './Footer';
import { usePluginGenerator } from '../hooks/usePluginGenerator';

export function PluginGenerator() {
  const {
    isLoading,
    results,
    currentProject,
    projectFiles,
    generatePlugin,
    downloadJar,
    downloadInstructions,
    loadProjectFiles,
    checkExistingProject,
    sendChatMessage,
    chatMessages,
    clearChat,
    addChatMessage,
    projectStatus
  } = usePluginGenerator();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <HeroSection />
          
          <div className="max-w-4xl mx-auto">
            <PluginForm
              onSubmit={generatePlugin}
              isLoading={isLoading}
              onPluginNameChange={checkExistingProject}
              onUserIdChange={checkExistingProject}
              projectStatus={projectStatus}
            />
            
            {isLoading && <LoadingState />}
            
            {results && (
              <ResultsSection
                results={results}
                onDownloadJar={downloadJar}
                onDownloadInstructions={downloadInstructions}
              />
            )}
            
            <ChatSection
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              onClearChat={clearChat}
              currentProject={currentProject}
            />
            
            {projectFiles && (
              <ProjectSection
                projectFiles={projectFiles}
                currentProject={currentProject}
                onDownloadJar={downloadJar}
                onDownloadInstructions={downloadInstructions}
                onRefreshProject={loadProjectFiles}
              />
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
