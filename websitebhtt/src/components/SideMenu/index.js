import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DARK_BACKGROUND = "#001529";

function SideMenu() {
    const { t } = useTranslation();
    const location = useLocation();
    const [selectedKeys, setSelectedKeys] = useState("/admin");
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const pathName = location.pathname.startsWith('/admin/help')
            ? '/admin/help'
            : location.pathname;
        setSelectedKeys(pathName);
    }, [location.pathname]);

    return (
        <div
            className="SideMenu"
            style={{
                background: DARK_BACKGROUND,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: collapsed ? 80 : 220,
                transition: "width 0.3s ease",
                flexShrink: 0,
            }}
        >
            <style>
                {`
                .ant-menu.SideMenuVertical {
                    padding: 0 0 8px 0;
                }
                .ant-menu.SideMenuVertical .ant-menu-item:first-child {
                    margin-top: 0 !important;
                }

                .ant-menu-dark .ant-menu-item-selected::after,
                .ant-menu-dark .ant-menu-item::after,
                .ant-menu-item-selected::after,
                .ant-menu-item::after {
                    display: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: none !important;
                }

                .ant-menu-dark .ant-menu-item-selected,
                .ant-menu-item-selected {
                    border-bottom: none !important;
                    box-shadow: none !important;
                }

                .ant-menu-dark .ant-menu-item-selected {
                    background-color: transparent !important;
                    border-radius: 0 !important;
                }

                .ant-menu-dark .ant-menu-item-selected .ant-menu-title-content,
                .ant-menu-dark .ant-menu-item-selected .anticon {
                    color: white !important;
                }

                .ant-menu-dark .ant-menu-item:not(.ant-menu-item-selected):hover {
                    background: linear-gradient(135deg, #f51010ff 0%, #764ba2 100%) !important;
                }
                .ant-menu-dark .ant-menu-item:not(.ant-menu-item-selected):hover .ant-menu-title-content {
                    color: #fff !important;
                }

                .ant-menu-dark .ant-menu-item .ant-menu-title-content {
                    position: relative;
                    z-index: 10;
                }

                .ant-menu-dark .ant-menu-item {
                    background-color: transparent !important;
                    transition: background 0.3s ease;
                }

                .menu-item-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    position: relative;
                }

                .menu-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    transition: transform 0.3s ease, margin-left 0.3s ease;
                }

                .menu-text {
                    flex: 1;
                    transition: opacity 0.3s ease, max-width 0.3s ease;
                    white-space: nowrap;
                    max-width: 100%;
                    overflow: hidden;
                }

                .menu-item-wrapper:hover .menu-icon-wrapper {
                    transform: scale(1.6);
                    margin-left: calc(50% - 12px);
                    transition: transform 0.3s ease, margin-left 0.3s ease;
                }

                .menu-item-wrapper:hover .menu-text {
                    opacity: 0;
                    max-width: 0;
                    transition: opacity 0.3s ease, max-width 0.3s ease;
                }

                /* Ẩn text khi collapse */
                .menu-collapsed .menu-text {
                    opacity: 0;
                    max-width: 0;
                    transition: opacity 0.3s ease, max-width 0.3s ease;
                }

                /* ========== COLLAPSE BUTTON - REDESIGNED ========== */
                .collapse-btn-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 16px 0;
                    margin-top: auto;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    background: linear-gradient(180deg, rgba(255, 77, 79, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
                    transition: background 0.3s ease;
                }

                .collapse-btn-wrapper:hover {
                    background: linear-gradient(180deg, rgba(255, 77, 79, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
                }

                .collapse-btn {
                    background: linear-gradient(135deg, rgba(255, 77, 79, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
                    border: 1.5px solid rgba(255, 77, 79, 0.3);
                    border-radius: 12px;
                    color: #fff;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                    padding: 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                .collapse-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                }

                .collapse-btn:hover::before {
                    left: 100%;
                }

                .collapse-btn:hover {
                    background: linear-gradient(135deg, rgba(255, 77, 79, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
                    border-color: rgba(255, 77, 79, 0.5);
                    box-shadow: 0 6px 20px rgba(255, 77, 79, 0.3);
                    transform: translateY(-2px);
                }

                .collapse-btn:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2);
                }

                .collapse-btn-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: transform 0.3s ease;
                }

                .collapse-btn:hover .collapse-btn-icon {
                    transform: scale(1.2) rotate(180deg);
                }

                /* Tooltip styling */
                .collapse-btn-tooltip {
                    position: absolute;
                    bottom: -32px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease;
                    z-index: 10;
                }

                .collapse-btn:hover .collapse-btn-tooltip {
                    opacity: 1;
                }
                `}
            </style>

            <Menu
                className={`SideMenuVertical ${collapsed ? "menu-collapsed" : ""}`}
                theme="dark"
                style={{
                    background: "transparent",
                    borderRight: 0,
                    flexGrow: 1,
                    paddingTop: "20px",
                }}
                mode="vertical"
                onClick={(item) => {
                    navigate(item.key);
                }}
                selectedKeys={[selectedKeys]}
                items={[
                    {
                        label: (
                            <div className="menu-item-wrapper">
                                <div className="menu-icon-wrapper">
                                    <span style={{ fontSize: '18px' }}>🏠</span>
                                </div>
                                <span className="menu-text">{t("overview") || "Tổng quan"}</span>
                            </div>
                        ),
                        icon: null,
                        key: "/admin",
                    },
                    {
                        label: (
                            <div className="menu-item-wrapper">
                                <div className="menu-icon-wrapper">
                                    <span style={{ fontSize: '18px' }}>📦</span>
                                </div>
                                <span className="menu-text">{t("inventory") || "Quản lý kho"}</span>
                            </div>
                        ),
                        icon: null,
                        key: "/admin/inventory",
                    },
                    {
                        label: (
                            <div className="menu-item-wrapper">
                                <div className="menu-icon-wrapper">
                                    <span style={{ fontSize: '18px' }}>🛒</span>
                                </div>
                                <span className="menu-text">{t("orders") || "Đơn hàng"}</span>
                            </div>
                        ),
                        icon: null,
                        key: "/admin/orders",
                    },
                    {
                        label: (
                            <div className="menu-item-wrapper">
                                <div className="menu-icon-wrapper">
                                    <span style={{ fontSize: '18px' }}>👨🏻‍💼</span>
                                </div>
                                <span className="menu-text">{t("staffs") || "Nhân viên"}</span>
                            </div>
                        ),
                        icon: null,
                        key: "/admin/staffs",
                    },
                    {
                        label: (
                            <div className="menu-item-wrapper">
                                <div className="menu-icon-wrapper">
                                    <span style={{ fontSize: '18px' }}>🧏‍♂️</span>
                                </div>
                                <span className="menu-text">{t("customers") || "Khách hàng"}</span>
                            </div>
                        ),
                        icon: null,
                        key: "/admin/customers",
                    },
                    {
                        label: (
                            <div className="menu-item-wrapper">
                                <div className="menu-icon-wrapper">
                                    <span style={{ fontSize: '18px' }}>🎁</span>
                                </div>
                                <span className="menu-text">{t("marketing") || "Marketing & Khuyến mãi"}</span>
                            </div>
                        ),
                        icon: null,
                        key: "/admin/promotion",
                    },
                    {
                        label: (
                            <div className="menu-item-wrapper">
                                <div className="menu-icon-wrapper">
                                    <span style={{ fontSize: '18px' }}>🔥</span>
                                </div>
                                <span className="menu-text">{t("help") || "Hỗ trợ"}</span>
                            </div>
                        ),
                        icon: null,
                        key: "/admin/help",
                    },
                ]}
            />

            <div className="collapse-btn-wrapper">
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Mở menu" : "Đóng menu"}
                >
                    <div className="collapse-btn-icon">
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>
                    <div className="collapse-btn-tooltip">
                        {collapsed ? "Mở menu" : "Đóng menu"}
                    </div>
                </button>
            </div>
        </div>
    );
}

export default SideMenu;