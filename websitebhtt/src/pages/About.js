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
} from "antd";
import {
  ArrowRightOutlined,
  FacebookFilled,
  TwitterOutlined,
  InstagramFilled,
  LinkedinFilled,
  CheckCircleFilled
} from "@ant-design/icons";

import "../assets/style.css";

import avtMember from "../assets/images/avtmember.png";

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