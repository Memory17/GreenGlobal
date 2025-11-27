import { Layout, Divider } from "antd";
import ProductsList from "./ProductsList";
import QaA from "./QaA/QaA";

const { Content } = Layout;

const Home = () => {
  return (
    <Layout>
      <Content style={{ padding: "0" }}>
        <ProductsList />
        <Divider />
        <QaA />
      </Content>
    </Layout>
  );
};

export default Home;
