import React, { useEffect } from 'react';
import './TermsAndPolicies.css';
import { BackTop } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  SafetyCertificateOutlined, 
  FileProtectOutlined, 
  UserSwitchOutlined, 
  CreditCardOutlined, 
  
  TeamOutlined,
  ShopOutlined,
  SyncOutlined,
  GiftOutlined,
  ContactsOutlined,
  CrownOutlined,
  LockOutlined,
  SafetyOutlined,
  StopOutlined,
  CheckCircleOutlined,
  
  CarOutlined,
  DollarOutlined,
  BankOutlined,
  WalletOutlined,
  RocketOutlined
} from '@ant-design/icons';



const TermsAndPolicies = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-container">
      <div className="terms-wrapper">
        <div className="terms-header">
          <h1>{t('terms_page_title')}</h1>
          <p>{t('terms_page_subtitle')}</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2><SafetyCertificateOutlined /> {t('terms_sec_1_title')}</h2>
            <p className="section-intro">
              {t('terms_sec_1_intro')}
            </p>
            <div className="privacy-grid">
              <div className="privacy-item">
                <div className="privacy-icon"><LockOutlined /></div>
                <h4>{t('terms_privacy_1_title')}</h4>
                <p>{t('terms_privacy_1_desc')}</p>
              </div>
              <div className="privacy-item">
                <div className="privacy-icon"><SafetyOutlined /></div>
                <h4>{t('terms_privacy_2_title')}</h4>
                <p>{t('terms_privacy_2_desc')}</p>
              </div>
              <div className="privacy-item">
                <div className="privacy-icon"><UserSwitchOutlined /></div>
                <h4>{t('terms_privacy_3_title')}</h4>
                <p>{t('terms_privacy_3_desc')}</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><FileProtectOutlined /> {t('terms_sec_2_title')}</h2>
            <div className="terms-rules-container">
              <div className="rule-box allowed">
                <h3><CheckCircleOutlined /> {t('terms_allowed_title')}</h3>
                <ul>
                  <li>{t('terms_allowed_1')}</li>
                  <li>{t('terms_allowed_2')}</li>
                  <li>{t('terms_allowed_3')}</li>
                </ul>
              </div>
              <div className="rule-box forbidden">
                <h3><StopOutlined /> {t('terms_forbidden_title')}</h3>
                <ul>
                  <li>{t('terms_forbidden_1')}</li>
                  <li>{t('terms_forbidden_2')}</li>
                  <li>{t('terms_forbidden_3')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><SyncOutlined /> {t('terms_sec_3_title')}</h2>
            <div className="return-policy-banner">
              <div className="return-badge">
                <span className="days">30</span>
                <span className="text">{t('terms_return_badge_text')}</span>
              </div>
              <div className="return-details">
                <div className="return-step">
                  <CheckCircleOutlined /> <span>{t('terms_return_step_1')}</span>
                </div>
                <div className="return-step">
                  <CheckCircleOutlined /> <span>{t('terms_return_step_2')}</span>
                </div>
                <div className="return-step">
                  <CheckCircleOutlined /> <span>{t('terms_return_step_3')}</span>
                </div>
              </div>
            </div>
            <p className="return-note">{t('terms_return_note')}</p>
          </section>

          <section className="terms-section">
            <h2><CreditCardOutlined /> {t('terms_sec_4_title')}</h2>
            <div className="payment-grid">
              <div className="payment-card">
                <DollarOutlined className="pay-icon" />
                <h4>{t('terms_pay_cod')}</h4>
                <p>{t('terms_pay_cod_desc')}</p>
              </div>
              <div className="payment-card">
                <BankOutlined className="pay-icon" />
                <h4>{t('terms_pay_transfer')}</h4>
                <p>{t('terms_pay_transfer_desc')}</p>
              </div>
              <div className="payment-card">
                <CreditCardOutlined className="pay-icon" />
                <h4>{t('terms_pay_card')}</h4>
                <p>{t('terms_pay_card_desc')}</p>
              </div>
              <div className="payment-card">
                <WalletOutlined className="pay-icon" />
                <h4>{t('terms_pay_wallet')}</h4>
                <p>{t('terms_pay_wallet_desc')}</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><RocketOutlined /> {t('terms_sec_5_title')}</h2>
            <div className="shipping-container">
              <div className="shipping-info">
                <div className="shipping-icon-wrapper">
                  <CarOutlined />
                </div>
                <div className="shipping-text">
                  <h3>{t('terms_ship_nationwide')}</h3>
                  <p dangerouslySetInnerHTML={{ __html: t('terms_ship_time') }}></p>
                </div>
              </div>
              <div className="freeship-banner">
                <GiftOutlined />
                <span dangerouslySetInnerHTML={{ __html: t('terms_ship_free') }}></span>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><TeamOutlined /> {t('terms_sec_6_title')}</h2>
            <div className="terms-grid-2">
              <div className="terms-card">
                <h3>{t('terms_rights_title')}</h3>
                <ul>
                  <li>{t('terms_rights_1')}</li>
                  <li>{t('terms_rights_2')}</li>
                  <li>{t('terms_rights_3')}</li>
                </ul>
              </div>
              <div className="terms-card">
                <h3>{t('terms_obligations_title')}</h3>
                <ul>
                  <li>{t('terms_obligations_1')}</li>
                  <li>{t('terms_obligations_2')}</li>
                  <li>{t('terms_obligations_3')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2><ShopOutlined /> {t('terms_sec_7_title')}</h2>
            <p>{t('terms_sec_7_intro')}</p>
            <ul>
              <li><strong>{t('terms_sec_7_item_1_title')}</strong> {t('terms_sec_7_item_1_desc')}</li>
              <li><strong>{t('terms_sec_7_item_2_title')}</strong> {t('terms_sec_7_item_2_desc')}</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2><SyncOutlined /> {t('terms_sec_8_title')}</h2>
            <div className="process-steps">
              <div className="step-item">
                <div className="step-number">1</div>
                <span>{t('terms_step_1')}</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">2</div>
                <span>{t('terms_step_2')}</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">3</div>
                <span>{t('terms_step_3')}</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">4</div>
                <span>{t('terms_step_4')}</span>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                <div className="step-number">5</div>
                <span>{t('terms_step_5')}</span>
              </div>
            </div>
            <div className="complaint-box">
              <h3>{t('terms_complaint_title')}</h3>
              <p>{t('terms_complaint_desc')}</p>
            </div>
          </section>

          <section className="terms-section">
            <h2><GiftOutlined /> {t('terms_sec_9_title')}</h2>
            <ul>
              <li>{t('terms_promo_1')}</li>
              <li>{t('terms_promo_2')}</li>
              <li>{t('terms_promo_3')}</li>
              <li>{t('terms_promo_4')}</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2><ContactsOutlined /> {t('terms_sec_10_title')}</h2>
            <div className="contact-info-box">
              <p><strong>{t('terms_contact_company')}</strong></p>
              <p>📍 {t('terms_contact_address')}</p>
              <p>📧 {t('terms_contact_email')}</p>
              <p>☎️ {t('terms_contact_hotline')}</p>
              <p>🏢 {t('terms_contact_tax')}</p>
              <p>⏰ {t('terms_contact_hours')}</p>
            </div>
          </section>

          <section className="terms-section vip-terms-section">
            <h2><CrownOutlined /> {t('terms_sec_11_title')}</h2>
            <div className="vip-terms-content">
              <p>{t('terms_vip_intro')}</p>
              <ul>
                <li><strong>{t('terms_vip_1_title')}</strong> {t('terms_vip_1_desc')}</li>
                <li><strong>{t('terms_vip_2_title')}</strong> {t('terms_vip_2_desc')}</li>
                <li><strong>{t('terms_vip_3_title')}</strong> {t('terms_vip_3_desc')}</li>
                <li><strong>{t('terms_vip_4_title')}</strong> {t('terms_vip_4_desc')}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
      <BackTop />
    </div>
  );
};

export default TermsAndPolicies;
