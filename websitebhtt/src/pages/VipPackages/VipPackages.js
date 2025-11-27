import React, { useEffect, useState } from 'react';
import './VipPackages.css';
import { message, Modal, Collapse } from 'antd';
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
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBuyPackage = (packageName) => {
    Modal.confirm({
      title: 'Xác nhận mua gói',
      content: `Bạn có chắc chắn muốn đăng ký gói ${packageName} không?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        // Giả lập gọi API mua gói
        setTimeout(() => {
          message.success(`Chúc mừng! Bạn đã đăng ký thành công gói ${packageName}.`);
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
      name: 'Member',
      price: 'Miễn phí',
      period: '',
      icon: <UserOutlined />,
      className: 'silver',
      features: [
        'Tích điểm đổi quà',
        'Tham gia các đợt sale thông thường',
        'Hỗ trợ tiêu chuẩn',
        'Nhận thông báo khuyến mãi'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '299.000',
      period: '/ tháng',
      icon: <CrownOutlined />,
      className: 'gold',
      badge: 'Phổ biến',
      features: [
        'Giảm 5% toàn bộ đơn hàng',
        'Tặng 1-2 voucher mua sắm/tháng',
        'Miễn phí ship đơn từ 500k',
        'Ưu tiên hỗ trợ khách hàng'
      ]
    },
    {
      id: 'vip-plus',
      name: 'VIP+',
      price: '699.000',
      period: '/ tháng',
      icon: <SketchOutlined />,
      className: 'platinum featured',
      badge: 'Đẳng cấp nhất',
      features: [
        'Giảm 8-10% toàn bộ đơn hàng',
        'Voucher khủng & Mua sớm Flash Sale',
        'Đặc quyền mua sản phẩm giới hạn',
        'Thời gian đổi trả lên tới 60 ngày',
        'Ưu tiên xử lý đơn hàng siêu tốc',
        'Quà tặng tri ân định kỳ'
      ]
    }
  ];

  const extraPackages = [
    {
      id: 'vip-savings',
      name: 'VIP Tiết Kiệm',
      price: '149.000',
      period: '/ tháng',
      icon: <WalletOutlined />,
      className: 'silver',
      features: [
        'Giảm 3-5% toàn bộ đơn',
        'Nhiều voucher theo mùa',
        'Ưu đãi combo tạp hóa & quần áo'
      ]
    },
    {
      id: 'vip-fashion',
      name: 'VIP Thời Trang',
      price: '199.000',
      period: '/ tháng',
      icon: <SkinOutlined />,
      className: 'gold',
      features: [
        'Ưu tiên xem BST mới',
        'Giảm sâu thời trang & giày',
        'Đổi size linh hoạt',
        'Ưu đãi mua theo set'
      ]
    },
    {
      id: 'vip-family',
      name: 'VIP Gia Đình',
      price: '249.000',
      period: '/ tháng',
      icon: <HomeOutlined />,
      className: 'silver',
      features: [
        'Combo tạp hóa giá tốt',
        'Giảm ship đơn lớn',
        'Voucher gia dụng & nội thất nhỏ'
      ]
    },
    {
      id: 'vip-decor',
      name: 'VIP Nội Thất',
      price: '299.000',
      period: '/ tháng',
      icon: <AppstoreOutlined />,
      className: 'gold',
      features: [
        'Ưu đãi mua theo bộ',
        'Giảm giá đơn trị giá lớn',
        'Đổi trả linh hoạt nội thất'
      ]
    },
    {
      id: 'vip-sale',
      name: 'VIP Siêu Sale',
      price: '349.000',
      period: '/ tháng',
      icon: <FireOutlined />,
      className: 'platinum',
      features: [
        'Vào sớm Flash Sale',
        'Đặt trước Hot Deal',
        'Voucher độc quyền',
        'Số lượng giới hạn'
      ]
    },
    {
      id: 'vip-business',
      name: 'VIP Doanh Nhân',
      price: '1.999.000',
      period: '/ tháng',
      icon: <TrophyOutlined />,
      className: 'platinum featured',
      badge: 'Thượng lưu',
      features: [
        'Giảm giá cao nhất hệ thống',
        'Ưu tiên xử lý đơn',
        'Quà tri ân định kỳ',
        'Chăm sóc riêng 1:1'
      ]
    }
  ];

  const displayedPackages = showAll ? [...packages, ...extraPackages] : packages;

  const privileges = [
    {
      icon: <GlobalOutlined />,
      title: 'Mua Sắm Toàn Cầu',
      desc: 'Tiếp cận các bộ sưu tập giới hạn từ khắp nơi trên thế giới.'
    },
    {
      icon: <SkinOutlined />,
      title: 'Stylist Riêng',
      desc: 'Được tư vấn phong cách thời trang cá nhân bởi chuyên gia hàng đầu.'
    },
    {
      icon: <ThunderboltOutlined />,
      title: 'Giao Hàng Hỏa Tốc',
      desc: 'Nhận hàng trong vòng 2h tại nội thành và 24h toàn quốc.'
    },
    {
      icon: <GiftOutlined />,
      title: 'Quà Tặng Độc Quyền',
      desc: 'Nhận các món quà giá trị vào các dịp lễ tết và sinh nhật.'
    }
  ];

  const faqs = [
    {
      question: 'Làm sao để nâng cấp gói thành viên?',
      answer: 'Bạn có thể nâng cấp gói bất kỳ lúc nào bằng cách chọn gói mới và thanh toán phần chênh lệch. Thời hạn gói sẽ được tính lại từ đầu.'
    },
    {
      question: 'Quyền lợi có được áp dụng ngay sau khi mua không?',
      answer: 'Có, ngay sau khi thanh toán thành công, tài khoản của bạn sẽ được cập nhật trạng thái VIP và hưởng mọi đặc quyền ngay lập tức.'
    },
    {
      question: 'Tôi có thể hủy gói thành viên không?',
      answer: 'Gói thành viên không hỗ trợ hoàn tiền sau khi đã kích hoạt. Tuy nhiên, bạn có thể tắt tính năng tự động gia hạn bất cứ lúc nào.'
    }
  ];

  return (
    <div className="vip-container">
      {/* Hero Section */}
      <div className="vip-hero">
        <div className="vip-hero-content">
          <h1>Nâng Cấp VIP - Đặc Quyền Thượng Lưu</h1>
          <ul className="vip-hero-benefits">
            <li><CheckCircleOutlined /> Tiết kiệm hơn với ưu đãi giảm giá độc quyền</li>
            <li><CheckCircleOutlined /> Miễn phí vận chuyển & Giao hàng hỏa tốc</li>
            <li><CheckCircleOutlined /> Quà tặng sinh nhật & Voucher mua sắm hàng tháng</li>
          </ul>
          <button className="vip-hero-btn" onClick={scrollToPackages}>
            Đăng Ký Ngay <ArrowRightOutlined />
          </button>
        </div>
      </div>

      <div className="vip-header">
        <h2>Chọn Gói Phù Hợp Với Bạn</h2>
        <p>Đa dạng lựa chọn, tối ưu chi phí, tối đa quyền lợi</p>
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
              Đăng Ký Ngay
            </button>
          </div>
        ))}
      </div>

      <div className="vip-view-more-container">
        <button className="vip-view-more-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'THU GỌN' : 'XEM THÊM CÁC GÓI KHÁC'}
        </button>
      </div>

      <div className="vip-section-divider"></div>

      {/* Current Offers for VIP */}
      <div className="vip-offers-section">
        <h2 className="vip-section-title">Ưu Đãi Độc Quyền Tháng Này</h2>
        <div className="vip-offers-banner">
          <div className="vip-offer-item">
            <div className="offer-icon"><FireOutlined /></div>
            <div className="offer-content">
              <h3>Flash Sale Nội Bộ</h3>
              <p>Giảm thêm 20% cho 50+ sản phẩm hot nhất</p>
            </div>
          </div>
          <div className="vip-offer-item">
            <div className="offer-icon"><GiftOutlined /></div>
            <div className="offer-content">
              <h3>Quà Tặng Mùa Hè</h3>
              <p>Tặng set mỹ phẩm mini cho đơn từ 1 triệu</p>
            </div>
          </div>
          <div className="vip-offer-item">
            <div className="offer-icon"><ThunderboltOutlined /></div>
            <div className="offer-content">
              <h3>Mã Giảm Giá Thêm</h3>
              <p>Nhập mã <strong>VIPSUMMER</strong> giảm 50k</p>
            </div>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Who Should Use */}
      <div className="vip-target-section">
        <h2 className="vip-section-title">Ai Nên Nâng Cấp VIP?</h2>
        <div className="vip-target-grid">
          <div className="vip-target-card">
            <div className="target-icon"><ShoppingOutlined /></div>
            <h3>Tín Đồ Mua Sắm</h3>
            <p>Bạn thường xuyên mua quần áo, giày dép mỗi tháng? Gói VIP sẽ giúp bạn tiết kiệm đáng kể với ưu đãi giảm giá trên mọi đơn hàng.</p>
          </div>
          <div className="vip-target-card">
            <div className="target-icon"><HomeOutlined /></div>
            <h3>Người Nội Trợ</h3>
            <p>Gia đình hay đặt tạp hóa, đồ gia dụng online? Miễn phí vận chuyển và voucher hàng tháng là chân ái dành cho bạn.</p>
          </div>
          <div className="vip-target-card">
            <div className="target-icon"><AppstoreOutlined /></div>
            <h3>Yêu Thích Nội Thất</h3>
            <p>Bạn đang trang trí nhà cửa và mua các món đồ giá trị lớn? Đặc quyền đổi trả và bảo hành của VIP+ sẽ giúp bạn yên tâm tuyệt đối.</p>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Savings Example */}
      <div className="vip-savings-section">
        <h2 className="vip-section-title">Bài Toán Tiết Kiệm</h2>
        <div className="vip-savings-container">
          <div className="vip-savings-scenario">
            <h3><CalculatorOutlined /> Ví Dụ Thực Tế</h3>
            <p className="scenario-desc">Giả sử mỗi tháng bạn mua <strong>3 đơn hàng</strong>, trung bình <strong>500.000đ/đơn</strong>.</p>
            <div className="savings-breakdown">
              <div className="breakdown-row">
                <span>Tiền ship trung bình:</span>
                <span className="cost">90.000đ</span>
              </div>
              <div className="breakdown-row">
                <span>Giảm giá trực tiếp (5%):</span>
                <span className="cost">75.000đ</span>
              </div>
              <div className="breakdown-row">
                <span>Voucher tháng:</span>
                <span className="cost">50.000đ</span>
              </div>
              <div className="breakdown-total">
                <span>Tổng tiết kiệm với VIP:</span>
                <span className="total-save">215.000đ / tháng</span>
              </div>
            </div>
            <p className="savings-note">Chỉ với 299k/tháng, bạn đã "lãi" ngay từ tháng đầu tiên!</p>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Comparison Table */}
      <div className="vip-comparison-section">
        <h2 className="vip-section-title">So Sánh Quyền Lợi</h2>
        <div className="vip-comparison-table-wrapper">
          <table className="vip-comparison-table">
            <thead>
              <tr>
                <th>Quyền Lợi</th>
                <th>Thành Viên</th>
                <th className="highlight">VIP</th>
                <th className="premium">VIP+</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Giảm giá đơn hàng</td>
                <td>-</td>
                <td>5%</td>
                <td>8-10%</td>
              </tr>
              <tr>
                <td>Voucher mua sắm</td>
                <td>-</td>
                <td>1-2/tháng</td>
                <td>Voucher khủng</td>
              </tr>
              <tr>
                <td>Miễn phí vận chuyển</td>
                <td>-</td>
                <td>Đơn {'>'} 500k</td>
                <td>Không giới hạn</td>
              </tr>
              <tr>
                <td>Thời gian đổi trả</td>
                <td>7 ngày</td>
                <td>15 ngày</td>
                <td>60 ngày</td>
              </tr>
              <tr>
                <td>Hỗ trợ khách hàng</td>
                <td>Tiêu chuẩn</td>
                <td>Ưu tiên</td>
                <td>Siêu tốc 1:1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Social Proof */}
      <div className="vip-testimonials-section">
        <h2 className="vip-section-title">Khách Hàng Nói Gì Về VIP?</h2>
        <div className="vip-stats-banner">
          <div className="vip-stat-item">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">Thành viên VIP</span>
          </div>
          <div className="vip-stat-item">
            <span className="stat-number">4.9/5</span>
            <span className="stat-label">Đánh giá hài lòng</span>
          </div>
          <div className="vip-stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Gia hạn gói</span>
          </div>
        </div>
        <div className="vip-testimonials-grid">
          <div className="vip-testimonial-card">
            <div className="testimonial-rating"><StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled /></div>
            <p className="testimonial-text">"Từ khi nâng cấp lên VIP+, mình tiết kiệm được cả triệu tiền ship mỗi tháng. Quà tặng sinh nhật cũng rất xịn!"</p>
            <div className="testimonial-user">
              <span className="user-name">Nguyễn Thu Hà</span>
              <span className="user-badge">VIP+ Member</span>
            </div>
          </div>
          <div className="vip-testimonial-card">
            <div className="testimonial-rating"><StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled /></div>
            <p className="testimonial-text">"Gói VIP Thời Trang rất phù hợp với mình. Được xem trước bộ sưu tập mới và mua với giá ưu đãi."</p>
            <div className="testimonial-user">
              <span className="user-name">Trần Minh Tuấn</span>
              <span className="user-badge">VIP Thời Trang</span>
            </div>
          </div>
          <div className="vip-testimonial-card">
            <div className="testimonial-rating"><StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled /></div>
            <p className="testimonial-text">"Dịch vụ hỗ trợ khách hàng của gói Doanh Nhân thực sự đẳng cấp. Xử lý vấn đề cực nhanh."</p>
            <div className="testimonial-user">
              <span className="user-name">Lê Văn Hùng</span>
              <span className="user-badge">VIP Doanh Nhân</span>
            </div>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* Guide & Process */}
      <div className="vip-guide-section">
        <h2 className="vip-section-title">Quy Trình Đăng Ký Đơn Giản</h2>
        <div className="vip-steps">
          <div className="vip-step">
            <div className="step-number">1</div>
            <h3>Chọn Gói</h3>
            <p>Lựa chọn gói VIP phù hợp với nhu cầu mua sắm của bạn.</p>
          </div>
          <div className="vip-step">
            <div className="step-number">2</div>
            <h3>Thanh Toán</h3>
            <p>Thanh toán an toàn qua thẻ, ví điện tử hoặc chuyển khoản.</p>
          </div>
          <div className="vip-step">
            <div className="step-number">3</div>
            <h3>Kích Hoạt</h3>
            <p>Hệ thống tự động kích hoạt đặc quyền VIP ngay lập tức.</p>
          </div>
        </div>
        <p className="vip-guide-note">* Gói sẽ tự động gia hạn hàng tháng. Bạn có thể hủy gia hạn bất cứ lúc nào trong phần cài đặt tài khoản.</p>
      </div>

      <div className="vip-section-divider"></div>

      <div className="vip-privileges-section">
        <h2 className="vip-section-title">Đặc Quyền Thượng Lưu</h2>
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
        <h2 className="vip-section-title">Lưu Ý Quan Trọng</h2>
        <div className="quick-terms-content">
          <div className="term-item">
            <InfoCircleOutlined className="term-icon" />
            <p>Gói VIP sẽ tự động gia hạn hàng tháng. Bạn có thể hủy bất cứ lúc nào trong phần Cài đặt tài khoản.</p>
          </div>
          <div className="term-item">
            <InfoCircleOutlined className="term-icon" />
            <p>Ưu đãi giảm giá trực tiếp không áp dụng đồng thời với một số chương trình Flash Sale đặc biệt.</p>
          </div>
          <div className="term-item">
            <InfoCircleOutlined className="term-icon" />
            <p>Quà tặng sinh nhật sẽ được gửi vào ví voucher của bạn vào ngày đầu tiên của tháng sinh nhật.</p>
          </div>
        </div>
      </div>

      <div className="vip-section-divider"></div>

      {/* FAQ Section */}
      <div className="vip-faq-section">
        <h2 className="vip-section-title">Câu Hỏi Thường Gặp</h2>
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
          <Link to="/terms-and-policies">Điều khoản sử dụng</Link>
          <span className="separator">•</span>
          <Link to="/terms-and-policies">Chính sách hoàn tiền</Link>
          <span className="separator">•</span>
          <Link to="/terms-and-policies">Điều kiện ưu đãi</Link>
        </div>
        <div className="vip-support-contact">
          <h3>Cần hỗ trợ thêm?</h3>
          <p>Đội ngũ CSKH chuyên biệt cho VIP luôn sẵn sàng 24/7</p>
          <button className="vip-contact-btn">
            <QuestionCircleOutlined /> Chat Với Chuyên Viên
          </button>
        </div>
      </div>
    </div>
  );
};

export default VipPackages;
