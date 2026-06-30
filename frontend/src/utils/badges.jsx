import React from 'react';
import Badge from '../components/ui/Badge';

export function getStatusBadge(status) {
  switch (status) {
    case 'PENDING':
      return <Badge color="yellow">PENDING</Badge>;
    case 'APPROVED':
      return <Badge color="green">APPROVED</Badge>;
    case 'REJECTED':
      return <Badge color="red">REJECTED</Badge>;
    case 'HIDDEN':
      return <Badge color="gray">HIDDEN</Badge>;
    case 'DRAFT':
      return <Badge color="blue">DRAFT</Badge>;
    default:
      return <Badge color="gray">{status}</Badge>;
  }
}

export function getRoleBadge(role) {
  switch (role) {
    case 'STUDENT':
      return <Badge color="indigo">STUDENT</Badge>;
    case 'RECRUITER':
      return <Badge color="purple">RECRUITER</Badge>;
    case 'ADMIN':
      return <Badge color="orange">ADMIN</Badge>;
    default:
      return <Badge color="gray">{role}</Badge>;
  }
}
