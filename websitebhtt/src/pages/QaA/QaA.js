// src/pages/QaA/QaA.js
import React, { useState } from 'react';
import { Typography, Input, Empty, Button, Row, Col } from 'antd';
import { QuestionCircleOutlined, SearchOutlined, PlusOutlined, MinusOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { qnaData } from '../../data/qaaService.js';
import './QaA.css'; // Import file CSS

const { Title, Text } = Typography;

const QaA = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState(null);

  const translatedData = qnaData.map(item => ({
    ...item,
    question: t(`faq_q_${item.id}`),
    answer: t(`faq_a_${item.id}`)
  }));

  const filteredData = translatedData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleQuestion = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="qna-page-wrapper">
      <div className="qna-header-section">
        <Title level={2} className="qna-page-title">
          <QuestionCircleOutlined className="qna-title-icon" /> {t('faq_title')}
        </Title>
        <Text className="qna-subtitle">{t('faq_subtitle')}</Text>

        <div className="qna-search-container">
          <Input
            size="large"
            placeholder={t('search_faq_placeholder')}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="qna-search-input"
            allowClear
          />
        </div>
      </div>

      <div className="qna-content-container">
        {filteredData.length > 0 ? (
          <Row gutter={[24, 24]} className="qna-grid">
            {filteredData.map((item) => {
              const isActive = activeId === item.id;
              return (
                <Col xs={24} md={12} key={item.id}>
                  <div 
                    className={`qna-card ${isActive ? 'active' : ''}`}
                    onClick={() => toggleQuestion(item.id)}
                  >
                    <div className="qna-card-header">
                      <h3 className="qna-question-text">{item.question}</h3>
                      <div className="qna-toggle-icon">
                        {isActive ? <MinusOutlined /> : <PlusOutlined />}
                      </div>
                    </div>
                    <div className={`qna-card-body ${isActive ? 'open' : ''}`}>
                      <p className="qna-answer-text">{item.answer}</p>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty description={t('no_faq_found')} style={{ marginTop: 40 }} />
        )}
      </div>

      {/* Contact Support Section */}
      <div className="qna-contact-section">
        <div className="qna-contact-card">
          <div className="qna-contact-content-wrapper">
            <CustomerServiceOutlined className="qna-contact-icon" />
            <div className="qna-contact-info">
              <Title level={4} className="qna-contact-title">{t('still_have_questions')}</Title>
              <Text className="qna-contact-text">{t('support_desc')}</Text>
            </div>
          </div>
          <Link to="/contact">
            <Button type="primary" size="large" className="qna-contact-btn">
              {t('contact_support_now')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QaA;