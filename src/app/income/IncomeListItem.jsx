import React from 'react';
import { Card } from 'primereact/card';
import * as dayjs from 'dayjs';

const IncomeListItem = (props) => {
  const itemDetail = props.itemDetail;
  return (
    <Card>
      <div>
        <div className="" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 16 }}>{itemDetail.category.type}<div className="color-title">{itemDetail.amount} ₹.</div></div>
        <div className="color-title" style={{ fontSize: 12 }}>{dayjs(itemDetail.date).format('YYYY-MM-DD hh:mma')}</div>
      </div>
    </Card>
  );
}

export default React.memo(IncomeListItem);
