import React, { useState, useEffect } from 'react';
import './index.scss';

// 支持的语言列表
const languages = [
  { value: 'en', label: '英语' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日语' },
  { value: 'ko', label: '韩语' }
];

const Popup = () => {
  // 状态管理
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('zh');
  const [isEnabled, setIsEnabled] = useState(true);

  // 从存储中加载设置
  useEffect(() => {
    chrome.storage.sync.get(['sourceLanguage', 'targetLanguage', 'translationEnabled'], (result) => {
      if (result.sourceLanguage) {
        setSourceLanguage(result.sourceLanguage);
      }
      if (result.targetLanguage) {
        setTargetLanguage(result.targetLanguage);
      }
      if (result.translationEnabled !== undefined) {
        setIsEnabled(result.translationEnabled);
      }
    });
  }, []);

  // 保存源语言设置
  const handleSourceLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value;
    setSourceLanguage(language);
    chrome.storage.sync.set({ sourceLanguage: language });
  };

  // 保存目标语言设置
  const handleTargetLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value;
    setTargetLanguage(language);
    chrome.storage.sync.set({ targetLanguage: language });
  };

  // 保存启用状态
  const handleToggleEnabled = () => {
    const newEnabledState = !isEnabled;
    setIsEnabled(newEnabledState);
    chrome.storage.sync.set({ translationEnabled: newEnabledState });
  };

  return (
    <div className="popup-container">
      <h1 className="popup-title">翻译设置</h1>
      
      <div className="settings-section">
        <label className="settings-label">
          <input 
            type="checkbox" 
            checked={isEnabled} 
            onChange={handleToggleEnabled} 
          />
          启用划词翻译
        </label>
      </div>

      <div className="settings-section">
        <label className="settings-label">
          源语言：
          <select 
            value={sourceLanguage} 
            onChange={handleSourceLanguageChange} 
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="settings-section">
        <label className="settings-label">
          目标语言：
          <select 
            value={targetLanguage} 
            onChange={handleTargetLanguageChange} 
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="settings-footer">
        <p>划词翻译插件 v1.1.0</p>
      </div>
    </div>
  );
};

export default Popup;
