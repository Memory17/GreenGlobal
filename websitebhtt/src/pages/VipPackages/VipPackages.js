import React, { useEffect, useState } from 'react';
import './VipPackages.css';
import { message, Modal, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  CrownOutlined, 
  CheckCircleOutlined, 
  GiftOutlined, 
  GlobalOutlined, 
  SkinOutlined, 
  ThunderboltOutlined, 
  UserOutlined, 
  SketchOutlined,
  WalletOutlined,
  HomeOutlined,
  AppstoreOutlined,
  FireOutlined,
  TrophyOutlined,
  StarFilled,

  QuestionCircleOutlined,
  ArrowRightOutlined,
  ShoppingOutlined,

  CalculatorOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Panel } = Collapse;

const VipPackages = () => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBuyPackage = (packageName) => {
    Modal.confirm({
      title: t('vip_confirm_title'),
      content: t('vip_confirm_content', { package: packageName }),
      okText: t('vip_confirm_ok'),
      cancelText: t('vip_confirm_cancel'),
      onOk() {
        // Giả lập gọi API mua gói
        setTimeout(() => {
          message.success(t('vip_success_msg', { package: packageName }));
        }, 1000);
      }
    });
  };

  const scrollToPackages = () => {
    const element = document.getElementById('vip-packages-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const packages = [
    {
      id: 'member',
      name: t('pkg_member'),
      price: t('vip_val_free'),
      period: '',
      icon: <UserOutlined />,
      className: 'silver',
      features: [
        t('feat_points'),
        t('feat_sale'),
        t('feat_support_std'),
        t('feat_promo_notif')
      ]
    },
    {
      id: 'vip',
      name: t('pkg_vip'),
      price: '299.000',
      period: t('vip_val_month'),
      icon: <CrownOutlined />,
      className: 'gold',
      badge: t('vip_val_popular'),
      features: [
        t('feat_discount_5'),
        t('feat_voucher_1_2'),
        t('feat_free_ship_500'),
        t('feat_support_prio')
      ]
    },
    {
      id: 'vip-plus',
      name: t('pkg_vip_plus'),
      price: '699.000',
      period: t('vip_val_month'),
      icon: <SketchOutlined />,
      className: 'platinum featured',
      badge: t('vip_val_elite'),
      features: [
        t('feat_discount_8_10'),
        t('feat_voucher_huge'),
        t('feat_limit_prod'),
        t('feat_return_60'),
        t('feat_process_fast'),
        t('feat_gift_periodic')
      ]
    }
  ];

  const extraPackages = [
    {
      id: 'vip-savings',
      name: t('pkg_vip_savings'),
      price: '149.000',
      period: t('vip_val_month'),
      icon: <WalletOutlined />,
      className: 'silver',
      features: [
        t('feat_discount_3_5'),
        t('feat_voucher_season'),
        t('feat_combo_grocery')
      ]
    },
    {
      id: 'vip-fashion',
      name: t('pkg_vip_fashion'),
      price: '199.000',
      period: t('vip_val_month'),
      icon: <SkinOutlined />,
      className: 'gold',
      features: [
        t('feat_prio_new_coll'),
        t('feat_discount_deep'),
        t('feat_change_size'),
        t('feat_buy_set')
      ]
    },
    {
      id: 'vip-family',
      name: t('pkg_vip_family'),
      price: '249.000',
      period: t('vip_val_month'),
      icon: <HomeOutlined />,
      className: 'silver',
      features: [
        t('feat_combo_family'),
        t('feat_ship_large'),
        t('feat_voucher_home')
      ]
    },
    {
      id: 'vip-decor',
      name: t('pkg_vip_decor'),
      price: '299.000',
      period: t('vip_val_month'),
      icon: <AppstoreOutlined />,
      className: 'gold',
      features: [
        t('feat_buy_suite'),
        t('feat_discount_large'),
        t('feat_return_furn')
      ]
    },
    {
      id: 'vip-sale',
      name: t('pkg_vip_sale'),
      price: '349.000',
      period: t('vip_val_month'),
      icon: <FireOutlined />,
      className: 'platinum',
      features: [
        t('feat_early_flash'),
        t('feat_preorder_hot'),
        t('feat_voucher_excl'),
        t('feat_limit_qty')
      ]
    },
    {
      id: 'vip-business',
      name: t('pkg_vip_business'),
      price: '1.999.000',
      period: t('vip_val_month'),
      icon: <TrophyOutlined />,
      className: 'platinum featured',
      badge: t('vip_val_luxury'),
      features: [
        t('feat_discount_max'),
        t('feat_process_fast'),
        t('feat_gift_periodic'),
        t('feat_care_1_1')
      ]
    }
  ];

  const displayedPackages = showAll ? [...packages, ...extraPackages] : packages;

  const privileges = [
    {
      icon: <GlobalOutlined />,
      title: t('vip_privilege_1_title'),
      desc: t('vip_privilege_1_desc')
    },
    {
      icon: <SkinOutlined />,
      title: t('vip_privilege_2_title'),
      desc: t('vip_privilege_2_desc')
    },
    {
      icon: <ThunderboltOutlined />,
      title: t('vip_privilege_3_title'),
      desc: t('vip_privilege_3_desc')
    },
    {
      icon: <GiftOutlined />,
      title: t('vip_privilege_4_title'),
      desc: t('vip_privilege_4_desc')
    }
  ];

  const faqs = [
    {
      question: t('vip_faq_1_q'),
      answer: t('vip_faq_1_a')
    },
    {
      question: t('vip_faq_2_q'),
      answer: t('vip_faq_2_a')
    },
    {
      question: t('vip_faq_3_q'),
      answer: t('vip_faq_3_a')
    }
  ];

  return (
    <div className="vip-container">
      {/* Hero Section */}
      <div className="vip-hero">
        <div className="vip-hero-content">
          <h1>{t('vip_page_title')}</h1>
          <ul className="vip-hero-benefits">
            <li><CheckCircleOutlined /> {t('vip_hero_benefit_1')}</li>
            <li><CheckCircleOutlined /> {t('vip_hero_benefit_2')}</li>
            <li><CheckCircleOutlined /> {t('vip_hero_benefit_3')}</li>
          </ul>
          <button className="vip-hero-btn" onClick={scrollToPackages}>
            {t('vip_register_now')} <ArrowRightOutlined />
          </button>
        </div>
      </div>

      <div className="vip-header">
        <h2>{t('vip_header_title')}</h2>
        <p>{t('vip_header_subtitle')}</p>
      </div>

      <div id="vip-packages-list" className="vip-packages-grid">
        {displayedPackages.map((pkg) => (
          <div key={pkg.id} className={`vip-card ${pkg.className}`}>
            {pkg.badge && <div className="vip-badge">{pkg.badge}</div>}
            <div className="vip-icon">{pkg.icon}</div>
            <div className="vip-title">{pkg.name}</div>
            <div className="vip-price">
              <span className="amount">{pkg.price}</span>
              <span className="currency">đ</span>
              <span className="period">{pkg.period}</span>
            </div>
            <ul className="vip-benefits">
              {pkg.features.map((feature, index) => (
                <li key={index}>
                  <CheckCircleOutlined /> {feature}
                </li>
              ))}
            </ul>
            <button 
              className="vip-btn"
              onClick={() => handleBuyPackage(pkg.name)}
            >
              {t('vip_register_now')}
            </button>
          </div>
        ))}
      </div>

      <div className="vip-view-more-container">
        <button className="vip-view-more-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? t('vip_collapse') : t('vip_view_more')}
        </button>
      </div>

      <div className="vip-section-divider"></div>

      {/* Current Offers for VIP */}
      <div className="vip-offers-section">
        <h2 className="vip-section-title">{t('vip_offers_title')}</h2>
        <div className="vip-offers-banner">
          <div className="vip-offer-item">
            <div className="offer-icon"><FireOutlined /></div>
            <div className="offer-content">
              <h3>{t('vip_offer_1_title')}</h3>
              <p>{t('vip_offer_1_desc')}</p>
            </div>
          </div>
          <div className="vip-offer-item">
            <div className="offer-icon"><GiftOutlined /></div>
            <div className="offer-content">
              <h3>{t('vip_offer_2_title')}</h3>
              <p>{t('vip_offer_2_desc')}</p>
            </div>
          </div>
          <div className="vip-offer-item">
            <div className="offer-icon"><ThunderboltOutlined /></div>
            <div className="offer-content">
              <h3>{t('vip_offer_3_title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('vip_offer_3_desc') }}></p>
            </div>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Who Should Use */}
      <div className="vip-target-section">
        <h2 className="vip-section-title">{t('vip_target_title')}</h2>
        <div className="vip-target-grid">
          <div className="vip-target-card">
            <div className="target-icon"><ShoppingOutlined /></div>
            <h3>{t('vip_target_1_title')}</h3>
            <p>{t('vip_target_1_desc')}</p>
          </div>
          <div className="vip-target-card">
            <div className="target-icon"><HomeOutlined /></div>
            <h3>{t('vip_target_2_title')}</h3>
            <p>{t('vip_target_2_desc')}</p>
          </div>
          <div className="vip-target-card">
            <div className="target-icon"><AppstoreOutlined /></div>
            <h3>{t('vip_target_3_title')}</h3>
            <p>{t('vip_target_3_desc')}</p>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Savings Example */}
      <div className="vip-savings-section">
        <h2 className="vip-section-title">{t('vip_savings_title')}</h2>
        <div className="vip-savings-container">
          <div className="vip-savings-scenario">
            <h3><CalculatorOutlined /> {t('vip_savings_example')}</h3>
            <p className="scenario-desc" dangerouslySetInnerHTML={{ __html: t('vip_savings_desc') }}></p>
            <div className="savings-breakdown">
              <div className="breakdown-row">
                <span>{t('vip_savings_ship')}</span>
                <span className="cost">90.000đ</span>
              </div>
              <div className="breakdown-row">
                <span>{t('vip_savings_discount')}</span>
                <span className="cost">75.000đ</span>
              </div>
              <div className="breakdown-row">
                <span>{t('vip_savings_voucher')}</span>
                <span className="cost">50.000đ</span>
              </div>
              <div className="breakdown-total">
                <span>{t('vip_savings_total')}</span>
                <span className="total-save">215.000đ {t('vip_val_month')}</span>
              </div>
            </div>
            <p className="savings-note">{t('vip_savings_note')}</p>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Comparison Table */}
      <div className="vip-comparison-section">
        <h2 className="vip-section-title">{t('vip_comparison_title')}</h2>
        <div className="vip-comparison-table-wrapper">
          <table className="vip-comparison-table">
            <thead>
              <tr>
                <th>{t('vip_col_benefit')}</th>
                <th>{t('vip_col_member')}</th>
                <th className="highlight">{t('vip_col_vip')}</th>
                <th className="premium">{t('vip_col_vip_plus')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('vip_row_discount')}</td>
                <td>-</td>
                <td>5%</td>
                <td>8-10%</td>
              </tr>
              <tr>
                <td>{t('vip_row_voucher')}</td>
                <td>-</td>
                <td>1-2/{t('vip_val_month').replace('/ ', '')}</td>
                <td>{t('feat_voucher_huge')}</td>
              </tr>
              <tr>
                <td>{t('vip_row_shipping')}</td>
                <td>-</td>
                <td>{t('feat_free_ship_500')}</td>
                <td>{t('feat_free_ship_500').replace('500k', '0đ')}</td>
              </tr>
              <tr>
                <td>{t('vip_row_return')}</td>
                <td>7 {t('days')}</td>
                <td>15 {t('days')}</td>
                <td>60 {t('days')}</td>
              </tr>
              <tr>
                <td>{t('vip_row_support')}</td>
                <td>{t('feat_support_std')}</td>
                <td>{t('feat_support_prio')}</td>
                <td>{t('feat_care_1_1')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Social Proof */}
      <div className="vip-testimonials-section">
        <h2 className="vip-section-title">{t('vip_testimonials_title')}</h2>
        <div className="vip-stats-banner">
          <div className="vip-stat-item">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">{t('pkg_vip')} Member</span>
          </div>
          <div className="vip-stat-item">
            <span className="stat-number">4.9/5</span>
            <span className="stat-label">{t('avg_rating')}</span>
          </div>
          <div className="vip-stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">{t('vip_renewal_rate')}</span>
          </div>
        </div>
        <div className="vip-testimonials-grid">
          <div className="vip-testimonial-card">
            <div className="testimonial-rating"><StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled /></div>
            <p className="testimonial-text">"Từ khi nâng cấp lên VIP+, mình tiết kiệm được cả triệu tiền ship mỗi tháng. Quà tặng sinh nhật cũng rất xịn!"</p>
            <div className="testimonial-user">
              <span className="user-name">Nguyễn Thu Hà</span>
              <span className="user-badge">{t('pkg_vip_plus')} Member</span>
            </div>
          </div>
          <div className="vip-testimonial-card">
            <div className="testimonial-rating"><StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled /></div>
            <p className="testimonial-text">"Gói VIP Thời Trang rất phù hợp với mình. Được xem trước bộ sưu tập mới và mua với giá ưu đãi."</p>
            <div className="testimonial-user">
              <span className="user-name">Trần Minh Tuấn</span>
              <span className="user-badge">{t('pkg_vip_fashion')}</span>
            </div>
          </div>
          <div className="vip-testimonial-card">
            <div className="testimonial-rating"><StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled /></div>
            <p className="testimonial-text">"Dịch vụ hỗ trợ khách hàng của gói Doanh Nhân thực sự đẳng cấp. Xử lý vấn đề cực nhanh."</p>
            <div className="testimonial-user">
              <span className="user-name">Lê Văn Hùng</span>
              <span className="user-badge">{t('pkg_vip_business')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Guide & Process */}
      <div className="vip-guide-section">
        <h2 className="vip-section-title">{t('vip_guide_title')}</h2>
        <div className="vip-steps">
          <div className="vip-step">
            <div className="step-number">1</div>
            <h3>{t('vip_step_1_title')}</h3>
            <p>{t('vip_step_1_desc')}</p>
          </div>
          <div className="vip-step">
            <div className="step-number">2</div>
            <h3>{t('vip_step_2_title')}</h3>
            <p>{t('vip_step_2_desc')}</p>
          </div>
          <div className="vip-step">
            <div className="step-number">3</div>
            <h3>{t('vip_step_3_title')}</h3>
            <p>{t('vip_step_3_desc')}</p>
          </div>
        </div>
        <p className="vip-guide-note">{t('vip_guide_note')}</p>
      </div>

      <div className="vip-section-divider"></div>

      <div className="vip-privileges-section">
        <h2 className="vip-section-title">{t('vip_privileges_title')}</h2>
        <div className="vip-privileges-grid">
          {privileges.map((item, index) => (
            <div key={index} className="vip-privilege-card">
              <div className="privilege-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Quick Terms */}
      <div className="vip-quick-terms">
        <h2 className="vip-section-title">{t('vip_terms_title')}</h2>
        <div className="quick-terms-content">
          <div className="term-item">
            <InfoCircleOutlined className="term-icon" />
            <p>{t('vip_term_1')}</p>
          </div>
          <div className="term-item">
            <InfoCircleOutlined className="term-icon" />
            <p>{t('vip_term_2')}</p>
          </div>
          <div className="term-item">
            <InfoCircleOutlined className="term-icon" />
            <p>{t('vip_term_3')}</p>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* FAQ Section */}
      <div className="vip-faq-section">
        <h2 className="vip-section-title">{t('vip_faq_title')}</h2>
        <Collapse ghost expandIconPosition="end" className="vip-faq-collapse">
          {faqs.map((faq, index) => (
            <Panel header={faq.question} key={index}>
              <p>{faq.answer}</p>
            </Panel>
          ))}
        </Collapse>
      </div>

      <div className="vip-section-divider"></div>

      {/* Policy & Support */}
      <div className="vip-support-section">
        <div className="vip-support-links">
          <Link to="/terms-and-policies">{t('terms_and_policies')}</Link>
          <span className="separator">•</span>
          <Link to="/terms-and-policies">{t('refund_policy')}</Link>
          <span className="separator">•</span>
          <Link to="/terms-and-policies">{t('vip_conditions')}</Link>
        </div>
        <div className="vip-support-contact">
          <h3>{t('vip_support_contact')}</h3>
          <p>{t('vip_support_desc')}</p>
          <button className="vip-contact-btn">
            <QuestionCircleOutlined /> {t('vip_chat_support')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VipPackages;
