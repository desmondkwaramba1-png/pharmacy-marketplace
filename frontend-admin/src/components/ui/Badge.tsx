import React from 'react';
import type { StockStatus } from '../../types';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

interface BadgeProps {
  status: StockStatus;
}

const config: Record<StockStatus, { label: string; icon: React.ReactNode; className: string }> = {
  in_stock: { label: 'In Stock', icon: <FaCheckCircle />, className: 'badge-success' },
  low_stock: { label: 'Low Stock', icon: <FaExclamationTriangle />, className: 'badge-warning' },
  out_of_stock: { label: 'Out of Stock', icon: <FaTimesCircle />, className: 'badge-error' },
};

export default function Badge({ status }: BadgeProps) {
  const { label, icon, className } = config[status] || config.out_of_stock;
  return (
    <span className={`badge ${className}`}>
      {icon} {label}
    </span>
  );
}
