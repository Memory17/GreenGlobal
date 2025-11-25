import { Typography, Space } from "antd";
import {
    ShopOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import React from "react";
import { useTranslation } from "react-i18next";
import styled, { keyframes} from "styled-components";

// ==========================================================
// 1. STYLED COMPONENTS & ANIMATIONS (GIỮ NGUYÊN)
// ==========================================================

// Keyframes 1: Icon Pulse
const pulse = keyframes`
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.2; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
`;

// Keyframes 2: Text Pulse
const textPulse = keyframes`
    0% { color: #888; opacity: 0.7; } 
    50% { color: #777; opacity: 0.6; } 
    100% { color: #888; opacity: 0.7; }
`;

// Keyframes 3: Radial Pulse
const radialPulse = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
    }
`;

// Keyframes 4: Gradient Shift
const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

// Component cho Icon nhấp nháy + Radial Pulse
const AnimatedIcon = styled(Typography.Text)`
    color: #52c41a;
    font-weight: bold;
    display: flex;
    align-items: center;
    line-height: 1;

    & .anticon {
        border-radius: 50%;
        padding: 2px;
        animation: 
            ${pulse} 1.2s infinite cubic-bezier(0.4, 0, 0.6, 1),
            ${radialPulse} 2s infinite; 
    }
`;

// Component cho Text trạng thái (Mờ ảo)
const StatusText = styled(Typography.Text)`
    color: #888; 
    font-weight: bold;
    opacity: 0.7;
    font-size: 13px; 
    animation: ${textPulse} 4s infinite ease-in-out;
`;

// Component cho Footer Item Link (Neon Glow + Springy Hover)
const FooterLink = styled(Typography.Link)`
    display: flex !important;
    align-items: center;
    padding: 10px 18px; 
    border-radius: 18px; 
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
    text-decoration: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15); 
    flex-shrink: 0;
    position: relative;
    z-index: 10;

    &:hover {
        box-shadow: 
            0 10px 25px rgba(0,0,0,0.3), 
            0 0 20px 4px ${(props) => props['data-color'] || '#1890ff'}70; 
            
        transform: translateY(-5px) scale(1.03); 
        z-index: 11;
    }

    @media (max-width: 768px) {
        padding: 6px 10px;
        border-radius: 10px;
    }
`;

// Component chính cho Footer
const StyledAppFooter = styled.div`
    display: flex;
    justify-content: space-between; 
    align-items: center;
    font-family: 'Inter', sans-serif;
    
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1200; /* ensure app footer sits above mobile side menu and overlay */
    padding: 8px 16px; 
    padding-left: calc(220px + 24px); /* account for sidebar width + spacing */
    
    background: 
        linear-gradient(270deg, rgba(255, 255, 255, 0.85), rgba(240, 248, 255, 0.85), rgba(255, 255, 255, 0.85));
    background-size: 600% 100%; 
    animation: ${gradientShift} 30s ease infinite; 
    
    backdrop-filter: blur(20px); 
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15); 

    &:before {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 0;
        width: 80%;
        height: 1px;
        background: rgba(0, 0, 0, 0.05); 
    }

    @media (max-width: 768px) {
        padding: 5px 10px;
        padding-left: 16px;
        justify-content: space-between;
        background-size: 300% 100%;
        
        & .system-status-container {
            display: none;
        }
    }

    /* On mid-size screens where the side menu may overlap, keep minimal padding */
    @media (max-width: 1200px) {
        padding-left: 16px;
    }

    /* Mobile: stack items and center */
    @media (max-width: 576px) {
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        padding-left: 16px;
        & .footer-left {
            width: 100%;
            display: flex;
            justify-content: center;
        }
        & .footer-right {
            width: 100%;
            display: flex;
            justify-content: center;
        }
        & .footer-left .footer-item:not(.footer-brand) { display: none; }
        & .footer-left .footer-brand { padding: 6px 12px !important; border-radius: 8px; }
    }
`;

// ==========================================================
// 2. MAIN COMPONENT
// ==========================================================

function AppFooter() {
    const { t } = useTranslation();

    const FooterItem = ({ href, icon, text, color, bgColor, isBrand }) => (
        <FooterLink
            href={href}
            target="_blank"
            data-color={color}
            style={{ 
                backgroundColor: bgColor,
            }}
            className={isBrand ? 'footer-brand' : 'footer-item'}
        >
            <span
                style={{
                    color: color,
                    fontSize: "20px", 
                    marginRight: "10px", 
                    fontWeight: 600,
                }}
            >
                {icon}
            </span>
            <Typography.Text
                style={{
                    color: isBrand ? color : "#333",
                    fontWeight: isBrand ? 900 : 600, 
                    fontSize: "15px", 
                }}
            >
                {text}
            </Typography.Text>
        </FooterLink>
    );

    return (
        <StyledAppFooter className="AppFooter">
            <div className="footer-left">
                <Space 
                    size={24} 
                    style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                    }}
                >
                <FooterItem
                    href="https://www.google.com"
                    icon={<ShopOutlined />}
                    text={t("footer_brand_name")}
                    color="#1890ff"
                    bgColor="#e6f4ff"
                    isBrand={true}
                />
                <FooterItem
                    href="tel:+123456789"
                    icon={<PhoneOutlined />}
                    text={t("footer_phone_number")}
                    color="#00b96b"
                    bgColor="#e6fffb"
                />
                <FooterItem
                    href="https://www.google.com/maps"
                    icon={<EnvironmentOutlined />}
                    text={t("footer_address")}
                    color="#fa8c16"
                    bgColor="#fff7e6"
                />
                </Space>
            </div>

            <div className="footer-right">
                <div
                    className="system-status-container"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        paddingTop: '3px',
                    }}
                >
                <AnimatedIcon>
                    <CheckCircleOutlined />
                </AnimatedIcon>
                <StatusText>
                    {t("footer_system_status")}
                </StatusText>
                </div>
            </div>
        </StyledAppFooter>
    );
}

export default AppFooter;