// src/pages/About.js
import "../style/About.css";
import {
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Card,
  Rate,
  Carousel, // <-- THÊM

  Avatar,   // <-- THÊM
} from "antd";
import {
  ArrowRightOutlined,
  FacebookFilled,
  TwitterOutlined,
  InstagramFilled,
  LinkedinFilled,
  CheckCircleFilled,
  UsergroupAddOutlined, // <-- THÊM
  TrophyOutlined,       // <-- THÊM
  ShoppingOutlined,     // <-- THÊM
  SafetyCertificateOutlined, // <-- THÊM

  RocketOutlined,       // <-- THÊM
  MobileOutlined,       // <-- THÊM
  GlobalOutlined,       // <-- THÊM
} from "@ant-design/icons";

import "../assets/style.css";

import avtMember from "../assets/images/avtmember.png";
// Import Partner Logos
import visaLogo from "../assets/images/visa.png";
import MastercardLogo from "../assets/images/mastercard.png";
import PayPal from "../assets/images/paypal.png";
import GooglePay from "../assets/images/gpay.png";
import redbullLogo from "../assets/images/redbull.png";

const { Text, Title } = Typography;

const About = () => {

  return (
    <div className="about-us-page">
      {/* (Phần đầu giữ nguyên) */}
      <div className="title-about">
        <Title level={2} className="title-left-about">
          Sứ Mệnh Của Chúng Tôi: <br />
          Trải Nghiệm Mua Sắm Tốt Nhất
        </Title>
        <div className="title-right-about">
          <Text strong>Cam Kết Của Chúng Tôi</Text>
          <br />
          <Text>
            Mục tiêu của chúng tôi là mang đến cho bạn một nền tảng mua sắm trực tuyến
            liền mạch, an toàn và thú vị. Chúng tôi tin tưởng vào việc cung cấp
            không chỉ sản phẩm, mà còn là sự an tâm và hài lòng.
          </Text>
        </div>
      </div>
      <div style={{ padding: "0 90px" }}>
        <Divider className="divider-about" />
      </div>

      {/* (Phần 3 card dịch vụ giữ nguyên) */}
      <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>
        <Row className="about-us-service" gutter={[32, 32]}>
          <Col className="about-us-service-col" xs={24} md={8}>
            <div className="content">
              <img
                src="https://images.pexels.com/photos/105028/pexels-photo-105028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Sản phẩm đa dạng"
              />
              <Title level={4}>Sản Phẩm Đa Dạng</Title>
              <Text>
                Từ thời trang, công nghệ đến đồ gia dụng, chúng tôi tự hào mang đến
                hàng ngàn sản phẩm được chọn lọc kỹ lưỡng,
                đáp ứng mọi nhu cầu của bạn.
              </Text>
              <br />
              <Button type="secondary">
                Xem Sản Phẩm
                <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
          <Col className="about-us-service-col" xs={24} md={8}>
            <div className="content">
              <img
                src="https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Giao hàng nhanh"
              />
              <Title level={4}>Giao Hàng Thần Tốc</Title>
              <Text>
                Với hệ thống kho bãi hiện đại và đối tác vận chuyển tin cậy,
                đơn hàng của bạn sẽ được xử lý và giao đến tay bạn
                trong thời gian nhanh nhất.
              </Text>
              <br />
              <Button type="secondary">
                Theo Dõi Đơn
                <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
          <Col className="about-us-service-col" xs={24} md={8}>
            <div className="content">
              <img
                src="https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Chất lượng đảm bảo"
              />
              <Title level={4}>Chất Lượng Đảm Bảo</Title>
              <Text>
                Chúng tôi cam kết 100% sản phẩm là hàng chính hãng,
                với chính sách bảo hành và đổi trả rõ ràng,
                minh bạch để bảo vệ quyền lợi khách hàng.
              </Text>
              <br />
              <Button type="secondary">
                Xem Chính Sách
                <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
        </Row>
      </div>
      
      {/* === PHẦN HIGH-QUALITY (Đã sửa lỗi JS ở bước trước) === */}
      <div className="high-quality">
        <Row className="high-quality-row" gutter={32}>
          
          <Col className="high-quality-col-left" xs={24} md={12}>
            <Text>Giá Trị Vượt Trội</Text>
            <br />
            <Title level={2}>
              Sản Phẩm Chất Lượng Cao <br /> Với Mức Giá Tốt Nhất
            </Title>
            <Text className="text-content-2">
              Chúng tôi làm việc trực tiếp với các nhà cung cấp uy tín để
              cắt giảm chi phí trung gian, đảm bảo bạn luôn nhận được
              sản phẩm chất lượng với mức giá cạnh tranh và công bằng nhất.
            </Text>
            <br />
            <Button type="primary" className="high-quality-button">
              Mua Sắm Ngay
            </Button>
          </Col>

          <Col className="high-quality-col-left" xs={24} md={12}>
            <img
              src="https://images.pexels.com/photos/7770008/pexels-photo-7770008.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Sản phẩm chất lượng cao"
            />
          </Col>

        </Row>
      </div>

      {/* === 1. SOCIAL PROOF SECTION (NIỀM TIN KHÁCH HÀNG) === */}
      <div className="social-proof-section">
        <div className="title-about" style={{ paddingBottom: '2rem', justifyContent: 'center' }}>
          <Title level={2} className="title-left-about" style={{ textAlign: 'center', width: '100%' }}>
            Khách Hàng Nói Gì Về Chúng Tôi
          </Title>
        </div>
        
        {/* Stats */}
        <Row gutter={[32, 32]} className="stats-container">
          <Col xs={24} md={8}>
            <div className="stat-item">
              <UsergroupAddOutlined className="stat-icon" />
              <Title level={2} className="stat-number">100,000+</Title>
              <Text className="stat-label">Khách Hàng Hài Lòng</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="stat-item">
              <TrophyOutlined className="stat-icon" />
              <Title level={2} className="stat-number">5 Năm</Title>
              <Text className="stat-label">Kinh Nghiệm Phục Vụ</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="stat-item">
              <ShoppingOutlined className="stat-icon" />
              <Title level={2} className="stat-number">1,000,000+</Title>
              <Text className="stat-label">Đơn Hàng Đã Giao</Text>
            </div>
          </Col>
        </Row>

        {/* Testimonials Carousel */}
        <div className="testimonials-carousel-wrapper">
          <Carousel autoplay dots={true} effect="fade">
            <div className="testimonial-slide">
              <Card className="testimonial-card" bordered={false}>
                <Rate disabled defaultValue={5} />
                <Text className="testimonial-quote">
                  "Dịch vụ tuyệt vời! Tôi đã mua hàng ở đây 3 lần và chưa bao giờ thất vọng. Giao hàng nhanh và đóng gói rất cẩn thận."
                </Text>
                <div className="testimonial-user">
                  <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" size={50} />
                  <div className="user-info">
                    <Text strong>Nguyễn Thu Hà</Text>
                    <Text type="secondary">Khách hàng thân thiết</Text>
                  </div>
                </div>
              </Card>
            </div>
            <div className="testimonial-slide">
              <Card className="testimonial-card" bordered={false}>
                <Rate disabled defaultValue={5} />
                <Text className="testimonial-quote">
                  "Sản phẩm chất lượng, đúng như mô tả. Nhân viên tư vấn rất nhiệt tình và dễ thương. Sẽ ủng hộ dài dài!"
                </Text>
                <div className="testimonial-user">
                  <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" size={50} />
                  <div className="user-info">
                    <Text strong>Trần Minh Tuấn</Text>
                    <Text type="secondary">Đã mua 5 đơn hàng</Text>
                  </div>
                </div>
              </Card>
            </div>
            <div className="testimonial-slide">
              <Card className="testimonial-card" bordered={false}>
                <Rate disabled defaultValue={4.5} allowHalf />
                <Text className="testimonial-quote">
                  "Giá cả rất cạnh tranh so với thị trường. Tôi thích chính sách đổi trả minh bạch của shop. Rất an tâm khi mua sắm."
                </Text>
                <div className="testimonial-user">
                  <Avatar src="https://randomuser.me/api/portraits/women/68.jpg" size={50} />
                  <div className="user-info">
                    <Text strong>Lê Thị Mai</Text>
                    <Text type="secondary">Khách hàng mới</Text>
                  </div>
                </div>
              </Card>
            </div>
          </Carousel>
        </div>
      </div>

      {/* === 2. MILESTONES SECTION (DẤU MỐC) === */}
      <div className="milestones-section">
        <div className="title-about">
          <Title level={2} className="title-left-about">
            Hành Trình Của Chúng Tôi
          </Title>
          <div className="title-right-about">
            <Text strong>Những Dấu Mốc Đáng Nhớ</Text>
            <br />
            <Text>
              Từ những bước đi đầu tiên cho đến ngày hôm nay, chúng tôi đã không ngừng nỗ lực để mang đến trải nghiệm mua sắm tốt nhất.
            </Text>
          </div>
        </div>
        
        <div className="timeline-container">
          <div className="timeline-line"></div>

          {/* Item 1: 2020 */}
          <div className="timeline-row">
            <div className="timeline-content left">
              <Card className="timeline-card" bordered={false}>
                <div className="timeline-header">
                  <span className="timeline-year-badge">2020</span>
                  <Title level={4} style={{ margin: '10px 0 5px' }}>Thành Lập Công Ty</Title>
                </div>
                <Text>Khởi đầu với niềm đam mê cháy bỏng và 5 thành viên sáng lập tại một văn phòng nhỏ, đặt nền móng cho sứ mệnh phục vụ khách hàng.</Text>
              </Card>
            </div>
            <div className="timeline-marker">
              <div className="marker-dot"><RocketOutlined /></div>
            </div>
            <div className="timeline-content right">
              <div className="timeline-image-wrapper">
                <img src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Thành lập" />
              </div>
            </div>
          </div>

          {/* Item 2: 2021 */}
          <div className="timeline-row reverse">
            <div className="timeline-content left">
              <div className="timeline-image-wrapper">
                <img src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Mở rộng" />
              </div>
            </div>
            <div className="timeline-marker">
              <div className="marker-dot blue"><UsergroupAddOutlined /></div>
            </div>
            <div className="timeline-content right">
              <Card className="timeline-card" bordered={false}>
                <div className="timeline-header">
                  <span className="timeline-year-badge blue">2021</span>
                  <Title level={4} style={{ margin: '10px 0 5px' }}>Đạt 10.000 Khách Hàng</Title>
                </div>
                <Text>Mở rộng quy mô kho bãi và nhận được sự tin tưởng từ cộng đồng người tiêu dùng, đánh dấu bước tăng trưởng vượt bậc.</Text>
              </Card>
            </div>
          </div>

          {/* Item 3: 2022 */}
          <div className="timeline-row">
            <div className="timeline-content left">
              <Card className="timeline-card" bordered={false}>
                <div className="timeline-header">
                  <span className="timeline-year-badge red">2022</span>
                  <Title level={4} style={{ margin: '10px 0 5px' }}>Ra Mắt Ứng Dụng Di Động</Title>
                </div>
                <Text>Phát hành ứng dụng trên iOS và Android, mang đến trải nghiệm mua sắm tiện lợi mọi lúc mọi nơi cho khách hàng.</Text>
              </Card>
            </div>
            <div className="timeline-marker">
              <div className="marker-dot red"><MobileOutlined /></div>
            </div>
            <div className="timeline-content right">
              <div className="timeline-image-wrapper">
                <img src="https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=600" alt="App Mobile" />
              </div>
            </div>
          </div>

          {/* Item 4: 2024 */}
          <div className="timeline-row reverse">
            <div className="timeline-content left">
              <div className="timeline-image-wrapper">
                <img src="https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Quốc tế" />
              </div>
            </div>
            <div className="timeline-marker">
              <div className="marker-dot purple"><GlobalOutlined /></div>
            </div>
            <div className="timeline-content right">
              <Card className="timeline-card" bordered={false}>
                <div className="timeline-header">
                  <span className="timeline-year-badge purple">2024</span>
                  <Title level={4} style={{ margin: '10px 0 5px' }}>Vươn Tầm Quốc Tế</Title>
                </div>
                <Text>Bắt đầu hợp tác với các thương hiệu toàn cầu và mở rộng thị trường xuất khẩu, khẳng định vị thế thương hiệu.</Text>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* (Phần Meet the team giữ nguyên) */}
      <div className="title-about">
        <Title level={2} className="title-left-about">
          Gặp Gỡ Đội Ngũ <br />
          Sáng Lập
        </Title>
        <div className="title-right-about">
          <Text strong>Đội Ngũ Tâm Huyết</Text>
          <br />
          <Text>
            Chúng tôi là một đội ngũ đam mê công nghệ và thương mại điện tử,
            luôn nỗ lực không ngừng để cải tiến nền tảng và
            mang đến sự hài lòng tối đa cho khách hàng.
          </Text>
        </div>
      </div>
      <div style={{ padding: "0 90px" }}>
        <Divider className="divider-about" />
      </div>
      <div className="big-member-div">
        {/* (3 card thành viên giữ nguyên) */}
        <div className="member">
          <Card className="member-card" hoverable>
            <div className="member-img-wrapper">
              <img src={avtMember} alt="Member Avatar" className="member-img" />
            </div>
            <div className="member-info">
              <Text className="name-member">Doan Ba Luc</Text>
              <Rate defaultValue={5} disabled /> <br />
              <Text className="member-text">
                Founder & CEO - Lèo lái con thuyền, đảm bảo
                mọi hoạt động và trải nghiệm của bạn luôn trơn tru.
              </Text>
              <br />
              <div className="social-icons2">
                <FacebookFilled />
                <TwitterOutlined />
                <InstagramFilled />
                <LinkedinFilled />
              </div>
            </div>
          </Card>
        </div>
        <div className="member">
          <Card className="member-card" hoverable>
            <div className="member-img-wrapper">
              <img src={avtMember} alt="Member Avatar" className="member-img" />
            </div>
            <div className="member-info">
              <Text className="name-member">Doan Ba Min</Text>
              <Rate defaultValue={5} disabled /> <br />
              <Text className="member-text">
                Head of Products - Đam mê tìm kiếm và mang về
                những sản phẩm công nghệ mới nhất cho khách hàng.
              </Text>
              <br />
              <div className="social-icons2">
                <FacebookFilled />
                <TwitterOutlined />
                <InstagramFilled />
                <LinkedinFilled />
              </div>
            </div>
          </Card>
        </div>
        <div className="member">
          <Card className="member-card" hoverable>
            <div className="member-img-wrapper">
              <img src={avtMember} alt="Member Avatar" className="member-img" />
            </div>
            <div className="member-info">
              <Text className="name-member">Doan Van Hau</Text>
              <Rate defaultValue={5} disabled /> <br />
              <Text className="member-text">
                Head of Operations - Đảm bảo đơn hàng của bạn
                được đóng gói an toàn và giao đến tận tay nhanh nhất.
              </Text>
              <br />
              <div className="social-icons2">
                <FacebookFilled />
                <TwitterOutlined />
                <InstagramFilled />
                <LinkedinFilled />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* === 3. PARTNERSHIPS SECTION (ĐỐI TÁC) === */}
      <div className="partners-section">
        <div className="title-about" style={{ paddingBottom: '1rem', justifyContent: 'center' }}>
          <Title level={2} className="title-left-about" style={{ textAlign: 'center', width: '100%' }}>
            Đối Tác & Chứng Nhận
          </Title>
        </div>
        <div className="partners-logos-container">
          <div className="partner-logo-item"><img src={visaLogo} alt="Visa" /></div>
          <div className="partner-logo-item"><img src={MastercardLogo} alt="Mastercard" /></div>
          <div className="partner-logo-item"><img src={PayPal} alt="PayPal" /></div>
          <div className="partner-logo-item"><img src={GooglePay} alt="Google Pay" /></div>
          <div className="partner-logo-item"><img src={redbullLogo} alt="Redbull" /></div>
          {/* Placeholder logos if imports fail or are missing */}
          <div className="partner-logo-item">
             <div className="cert-badge">
                <SafetyCertificateOutlined style={{ fontSize: '30px', color: '#52c41a' }} />
                <Text strong style={{ marginLeft: 8 }}>SSL Secure</Text>
             </div>
          </div>
        </div>
      </div>

      {/* === PHẦN WELCOME WEBSITE (Đoạn code JS gốc của bạn) === */}
      <div className="welcome-website">
        <div className="welcome-website-img">
          <img
            src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Chào mừng đến website"
          />
        </div>
        <div className="welcome-website-content">
          <Title level={2}> Chào Mừng Đến Với Cửa Hàng!</Title>
          <Text className="welcome-website-text">
            Khám phá hàng ngàn sản phẩm tuyệt vời đang chờ bạn.
            Chúng tôi tự tin mang đến cho bạn những giá trị
            tốt nhất mà bạn không thể tìm thấy ở nơi khác.
          </Text>
          <div className="advantages-options">
            <div className="advantages-options-div">
              <CheckCircleFilled style={{color:"rgb(6, 190, 6)"}}/><Text className="advantages-options-text">Sản Phẩm Chính Hãng</Text>
            </div>
            <div className="advantages-options-div">
              <CheckCircleFilled style={{color:"rgb(6, 190, 6)"}}/><Text className="advantages-options-text">Giao Hàng Siêu Tốc</Text>
            </div>
          </div>
          <div className="advantages-options">
            <div className="advantages-options-div">
              <CheckCircleFilled style={{color:"rgb(6, 190, 6)"}}/><Text className="advantages-options-text">Giá Cả Cạnh Tranh</Text>
            </div>
            <div className="advantages-options-div">
              <CheckCircleFilled style={{color:"rgb(6, 190, 6)"}}/><Text className="advantages-options-text">Chất Lượng Tốt Nhất</Text>
            </div>
          </div>
          <div className="advantages-options">
            <div className="advantages-options-div">
              <CheckCircleFilled style={{color:"rgb(6, 190, 6)"}}/><Text className="advantages-options-text">Hỗ Trợ 24/7</Text>
            </div>
            <div className="advantages-options-div">
              <CheckCircleFilled style={{color:"rgb(6, 190, 6)"}}/><Text className="advantages-options-text">Thanh Toán An Toàn</Text>
            </div>
          </div>
          <div className="button-know">
            <Button className="button-know-primary" type="primary">Buy Now</Button>
            <Button className="button-know-secondary" type="secondary">Know More</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;