import { ChartType } from './dashboard.model';

const emailSentBarChart: ChartType = {
    chart: {
        height: 350,
        type: 'bar',
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '45%',
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    series: [{
        name: 'Annual Leave',
        data: [120, 135, 110, 125, 115, 130, 140]
    }, {
        name: 'Sick Leave',
        data: [45, 50, 40, 42, 38, 45, 48]
    }, {
        name: 'Emergency',
        data: [25, 30, 20, 22, 18, 25, 28]
    }],
    colors: ['#34c38f', '#f46a6a', '#50a5f1'],
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    },
    yaxis: {
        title: {
            text: 'Number of Requests'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + " requests"
            }
        }
    }
};

const monthlyEarningChart: ChartType = {
    chart: {
        height: 200,
        type: 'donut',
    },
    series: [45, 25, 30],
    labels: ['IT', 'HR', 'Finance'],
    colors: ['#34c38f', '#f46a6a', '#50a5f1'],
    legend: {
        show: false,
    },
    stroke: {
        width: 0
    },
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
            }
        }
    }
};

const transactions = [
    {
        id: '#EMP001',
        name: 'John Smith',
        date: '07 Oct, 2023',
        total: '$4,500',
        status: 'Paid',
        payment: ['fa-cc-mastercard', 'Direct Deposit'],
        index: 1
    },
    {
        id: '#EMP002',
        name: 'Sarah Johnson',
        date: '07 Oct, 2023',
        total: '$3,800',
        status: 'Paid',
        payment: ['fa-cc-visa', 'Direct Deposit'],
        index: 2
    },
    {
        id: '#EMP003',
        name: 'Michael Brown',
        date: '06 Oct, 2023',
        total: '$3,950',
        status: 'Pending',
        payment: ['fab fa-cc-paypal', 'Bank Transfer'],
        index: 3
    },
    {
        id: '#EMP004',
        name: 'Emily Davis',
        date: '05 Oct, 2023',
        total: '$4,200',
        status: 'Paid',
        payment: ['fa-cc-mastercard', 'Direct Deposit'],
        index: 4
    },
    {
        id: '#EMP005',
        name: 'Robert Wilson',
        date: '04 Oct, 2023',
        total: '$3,750',
        status: 'Paid',
        payment: ['fa-cc-visa', 'Direct Deposit'],
        index: 5
    },
    {
        id: '#EMP006',
        name: 'Lisa Anderson',
        date: '04 Oct, 2023',
        total: '$4,100',
        status: 'Paid',
        payment: ['fab fa-cc-paypal', 'Bank Transfer'],
        index: 6
    }
];

const statData = [{
    icon: 'bx bx-copy-alt',
    title: 'Orders',
    value: '1,235'
}, {
    icon: 'bx bx-archive-in',
    title: 'Revenue',
    value: '$35, 723'
}, {
    icon: 'bx bx-purchase-tag-alt',
    title: 'Average Price',
    value: '$16.2'
}];

export { emailSentBarChart, monthlyEarningChart, transactions, statData };
