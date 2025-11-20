import React, { useEffect, useState } from "react";
import {
    Card,
    Space,
    Typography,
    Flex,
    Tag,
    Table,
    Button,
    Row,
    Col,
    Tooltip,
    List,
    Avatar,
    Progress,
} from "antd";
import {
    LineChartOutlined,
    DollarOutlined,
    UserAddOutlined,
    ArrowUpOutlined,
    FireOutlined,
    TrophyOutlined,
    ShoppingCartOutlined,
    EyeOutlined,
    CrownOutlined,
    UserOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    ChartTooltip,
    Legend
);

const { Title: AntTitle, Text } = Typography;

const getCustomersFromAPI = async () => {
    try {
        const response = await fetch("https://dummyjson.com/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching customers:", error);
        return { users: [] };
    }
};

const getProductsFromAPI = async () => {
    try {
        const response = await fetch("https://dummyjson.com/products?limit=10");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return { products: [] };
    }
};

const formatCurrencyDisplay = (amount, i18n) => {
    const isVietnamese = i18n.language === 'vi';
    const formatter = new Intl.NumberFormat(isVietnamese ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: isVietnamese ? 'VND' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return formatter.format(amount);
};

const formatSpending = (amount, i18n) => {
    const isVietnamese = i18n.language === 'vi';

    if (isVietnamese) {
        if (amount >= 1000000000) return (amount / 1000000000).toFixed(2) + ' Tỷ VNĐ';
        if (amount >= 1000000) return (amount / 1000000).toFixed(2) + ' Tr VNĐ';
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    } else {
        if (amount >= 1000000) return (amount / 1000000).toFixed(1) + ' M USD';
        if (amount >= 1000) return (amount / 1000).toFixed(1) + ' K USD';
        return formatCurrencyDisplay(amount, i18n);
    }
};

function StatCard({ title, value, icon, color, bg, growth = null, animationDelay = '0s' }) {
    const floatDelay = `calc(0.5s + ${animationDelay})`;

    const renderValue = () => {
        if (growth !== null) {
            const isPositive = growth >= 0;
            return (
                <Flex align="center" gap={8}>
                    <AntTitle level={4} style={{ margin: 0, color: 'white', fontWeight: 800, fontSize: 20 }}>
                        {value}
                    </AntTitle>
                    <Tag
                        color={isPositive ? '#00e676' : '#ff1744'}
                        icon={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        style={{ fontWeight: 600, padding: '2px 6px', fontSize: 12, border: 'none', color: 'white' }}
                    >
                        {Math.abs(growth)}%
                    </Tag>
                </Flex>
            );
        }

        return (
            <AntTitle level={4} style={{ margin: 0, color: 'white', fontWeight: 800, fontSize: 18 }}>
                {value}
            </AntTitle>
        );
    };

    const cardStyle = {
        borderRadius: 12,
        background: bg,
        overflow: 'hidden',
        transition: 'all 0.3s ease-out',
        boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
        minHeight: '94px',
        padding: '14px',
        opacity: 0,
        willChange: 'transform, opacity',
        animation:
            `revealAnimation 0.5s ease-out ${animationDelay} forwards, ` +
            `floatAnimation 4s ease-in-out ${floatDelay} infinite`,
    };

    return (
        <Card
            bordered={false}
            style={cardStyle}
            bodyStyle={{ padding: 0 }}
        >
            <Flex justify="space-between" align="flex-start">
                <Space direction="vertical" size={2}>
                    <Text style={{ color: 'white', fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>
                        {title}
                    </Text>
                    {renderValue()}
                </Space>

                <div style={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.5)', opacity: 1 }}>
                    {icon}
                </div>
            </Flex>
        </Card>
    );
}

function StatCardsWrapper({ children }) {
    return (
        <div style={{
            padding: '20px',
            borderRadius: 16,
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        }}>
            {children}
        </div>
    );
}

function MonthlyRevenueChart({ data }) {
    const { t } = useTranslation();

    const labels = [
        "Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"
    ];

    const unit = '(K VNĐ)';

    const chartData = {
        labels,
        datasets: [
            {
                label: `${t('revenue')} ${unit}`,
                data: data,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <Card
            title={t("revenue_analysis")}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
            <div style={{ height: '280px' }}>
                <Line options={options} data={chartData} />
            </div>
        </Card>
    );
}

function BestSellingProductsChart({ data }) {
    const { t } = useTranslation();

    const labels = data.slice(0, 4).map(p => p.title.substring(0, 18));
    const salesData = data.slice(0, 4).map(p => Math.floor(p.price * (Math.random() * 100 + 50)));

    const chartData = {
        labels,
        datasets: [
            {
                label: t('revenue'),
                data: salesData,
                backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 75, 0.7)', 'rgba(255, 206, 86, 0.7)'],
                borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(75, 192, 75)', 'rgb(255, 206, 86)'],
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { beginAtZero: true },
        },
    };

    return (
        <Card
            title={t("product_performance")}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
            <div style={{ height: '220px' }}>
                <Bar options={options} data={chartData} />
            </div>
        </Card>
    );
}

function TopCustomersRanking() {
    const { t, i18n } = useTranslation();

    const [topCustomers, setTopCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxSpending, setMaxSpending] = useState(0);

    useEffect(() => {
        getCustomersFromAPI().then(res => {
            const customersWithSpending = (res.users || []).slice(0, 5).map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                totalSpending: Math.floor(Math.random() * 50000000) + 10000000,
            })).sort((a, b) => b.totalSpending - a.totalSpending);

            setMaxSpending(customersWithSpending[0]?.totalSpending || 1);
            setTopCustomers(customersWithSpending);
            setLoading(false);
        });
    }, []);

    const rankIcons = [
        <CrownOutlined style={{ color: '#ffc53d', fontSize: 22 }} />,
        <CrownOutlined style={{ color: '#d9d9d9', fontSize: 18 }} />,
        <CrownOutlined style={{ color: '#ff7875', fontSize: 16 }} />,
    ];

    return (
        <Card
            title={<Space><TrophyOutlined style={{ color: '#ffc53d' }} /> {t('top_spending_customers')}</Space>}
            bordered={false}
            style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: '100%',
            }}
            loading={loading}
        >
            <List
                itemLayout="horizontal"
                dataSource={topCustomers}
                renderItem={(item, index) => {
                    const progressPercent = Math.round((item.totalSpending / maxSpending) * 100);
                    return (
                        <List.Item style={{ padding: '12px 0' }}>
                            <Flex align="center" style={{ width: '100%' }}>
                                <div style={{ minWidth: 30, textAlign: 'center' }}>
                                    {index < 3 ? rankIcons[index] : <Typography.Text type="secondary">{index + 1}</Typography.Text>}
                                </div>

                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            src={item.image}
                                            icon={<UserOutlined />}
                                            style={{ backgroundColor: index < 3 ? '#ffc53d33' : '#f5f5f5' }}
                                        />
                                    }
                                    title={<Typography.Text strong ellipsis>{item.firstName} {item.lastName}</Typography.Text>}
                                    description={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.email}</Typography.Text>}
                                    style={{ width: '160px', minWidth: '160px', paddingRight: '10px' }}
                                />

                                <Flex direction="column" align="flex-end" style={{ flexGrow: 1, minWidth: '100px' }}>
                                    <Typography.Text strong style={{ color: index === 0 ? '#fa8c16' : '#850a0aff', fontSize: 13 }}>
                                        {formatSpending(item.totalSpending, i18n)}
                                    </Typography.Text>
                                    <Tooltip title={`${progressPercent}%`}>
                                        <Progress
                                            percent={progressPercent}
                                            showInfo={false}
                                            strokeColor={index === 0 ? '#ffc53d' : '#850a0aff'}
                                            size="small"
                                            style={{ width: '100%', marginTop: 2 }}
                                        />
                                    </Tooltip>
                                </Flex>
                            </Flex>
                        </List.Item>
                    );
                }}
            />
        </Card>
    );
}

function RecentOrdersTable() {
    const { t, i18n } = useTranslation();

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getProductsFromAPI().then((res) => {
            const items = (res.products || [])
                .slice(0, 5)
                .map((p) => ({
                    key: p.id,
                    title: p.title,
                    quantity: Math.floor(Math.random() * 5) + 1,
                    price: p.price,
                    image: p.thumbnail,
                }));
            setDataSource(items);
            setLoading(false);
        });
    }, []);

    const columns = [
        {
            title: t("product_name"),
            dataIndex: "title",
            width: '45%',
            align: 'left',
            render: (text) => <Typography.Text strong>{text.substring(0, 30)}</Typography.Text>,
        },
        {
            title: t("quantity"),
            dataIndex: "quantity",
            width: '15%',
            align: 'center',
            render: (qty) => <Tag color="blue">{qty}</Tag>
        },
        {
            title: t("unit_price"),
            dataIndex: "price",
            width: '25%',
            align: 'right',
            render: (v) => formatCurrencyDisplay(v, i18n),
        },
        {
            title: t("action"),
            width: '15%',
            align: 'right',
            render: () => (
                <Tooltip title={t("view_order_details")}>
                    <Button
                        size="small"
                        type="link"
                        icon={<EyeOutlined />}
                    >
                        {t("details")}
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <Card
            title={<Space><ShoppingCartOutlined /> {t('recent_orders')}</Space>}
            bordered={false}
            style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: '100%',
                overflow: 'hidden'
            }}
            bodyStyle={{ padding: '0 5px 10px 5px' }}
        >
            <style>
                {`
                .ant-table-thead > tr > th {
                    white-space: nowrap; 
                    padding: 10px 5px !important;
                }
                .ant-table-tbody > tr > td {
                    padding: 8px 5px !important; 
                }
                `}
            </style>

            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                size="middle"
            />
        </Card>
    );
}


function RevenueReports() {
    const { t, i18n } = useTranslation();

    const [stats, setStats] = useState({
        totalRevenue: 0,
        growthRate: 0,
        newCustomers: 0,
        topProduct: ""
    });

    const [monthlyData] = useState([15, 22, 31, 28, 45, 52, 60, 68, 85, 75, 92, 105]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const [usersRes, productsRes] = await Promise.all([
                getCustomersFromAPI(),
                getProductsFromAPI()
            ]);

            const users = usersRes.users || [];
            const prods = productsRes.products || [];

            const totalRev = users.length * 5000000;
            const newCusts = users.length;
            const topProd = prods.length > 0 ? prods[0].title : "Top Product";

            setStats({
                totalRevenue: totalRev,
                growthRate: Math.floor(Math.random() * 15) + 5,
                newCustomers: newCusts,
                topProduct: topProd.substring(0, 25)
            });

            setProducts(prods);
        };

        loadData();
    }, []);

    const totalRevenueFormatted = formatCurrencyDisplay(stats.totalRevenue, i18n);

    return (
        <Space
            direction="vertical"
            size={24}
            style={{
                width: "100%",
                padding: "24px",
                background: "#f5f7fa",
                borderRadius: "12px",
            }}
        >
            {/* --- NEW HEADER STYLE: MODERN TECH (UPDATED) --- */}
            <AntTitle level={1} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px', // Khoảng cách giữa icon và chữ
                marginBottom: 0,
                fontFamily: "'Montserrat', sans-serif", // Sử dụng font Montserrat
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: '-0.5px',
            }}>
                {/* Hộp Icon có Gradient */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #00b96b, #005e36)',
                    borderRadius: '12px',
                    padding: '10px',
                    boxShadow: '0 8px 16px rgba(0, 185, 107, 0.2)'
                }}>
                    <LineChartOutlined style={{ color: '#fff', fontSize: 24 }} />
                </div>

                {/* Chữ có Gradient */}
                <span style={{
                    background: 'linear-gradient(to right, #2c3e50, #00b96b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase'
                }}>
                    {t("total_overview")}
                </span>
            </AntTitle>

            {/* --- STATISTIC CARDS WRAPPER --- */}
            <StatCardsWrapper>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <StatCard
                            title={t("total_revenue")}
                            value={totalRevenueFormatted}
                            icon={<DollarOutlined />}
                            bg="linear-gradient(135deg, #1e9d72, #b89229ff)"
                            animationDelay="0.1s"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <StatCard
                            title={t("growth_rate")}
                            value={`+${stats.growthRate}%`}
                            icon={<LineChartOutlined />}
                            bg="linear-gradient(135deg, #c01313ff, #231f1fff)"
                            growth={stats.growthRate}
                            animationDelay="0.2s"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <StatCard
                            title={t("new_customers")}
                            value={stats.newCustomers.toLocaleString(i18n.language)}
                            icon={<UserAddOutlined />}
                            bg="linear-gradient(135deg, #043746ff, #3b74e1)"
                            animationDelay="0.3s"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <StatCard
                            title={t("top_product")}
                            value={stats.topProduct}
                            icon={<FireOutlined />}
                            bg="linear-gradient(135deg, #e39d37, #cf0e92ff)"
                            animationDelay="0.4s"
                        />
                    </Col>
                </Row>
            </StatCardsWrapper>

            {/* --- CHARTS & RANKING LIST --- */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={15} lg={15}>
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <MonthlyRevenueChart data={monthlyData} />
                        <BestSellingProductsChart data={products} />
                    </Space>
                </Col>

                <Col xs={24} sm={24} md={9} lg={9}>
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <TopCustomersRanking />
                        <RecentOrdersTable />
                    </Space>
                </Col>
            </Row>

            <style>{`
                /* Import font Montserrat cho tiêu đề */
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&display=swap');

                @keyframes revealAnimation {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes floatAnimation {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
            `}</style>
        </Space>
    );
}

export default RevenueReports;