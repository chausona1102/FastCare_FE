import React from 'react';

function SkeletonRow() {
  return (
    <div className="card rounded-4 mb-3 shadow-sm border-0">
      <div className="card-body p-3 skeleton-row">
        <div className="d-flex gap-3 align-items-start">
          <div className="skeleton-checkbox rounded-circle"></div>
          <div className="skeleton-image rounded-4"></div>
          <div className="flex-grow-1">
            <div className="skeleton-line mb-2"></div>
            <div className="skeleton-line short mb-3"></div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton-line smaller"></div>
              <div className="skeleton-line small"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartSkeleton() {
  return (
    <div>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
