import { useLocation } from 'react-router-dom';

const Result = () => {
    const location = useLocation();
    const searchResults = location.state?.searchResults || [];

    console.log("Search Results:", searchResults);

    return (
        <div className="result-section">
            <h2>ผลลัพธ์การค้นหา</h2>
            {searchResults.length === 0 ? (
                <p className="text-red-500">ไม่พบข้อมูลที่ตรงกับหมายพนักงานที่ค้นหา</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>เบอร์โทรศัพท์</th>
                            <th>ปัญหา</th>
                            <th>รูปภาพ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {searchResults.map((item, index) => (
                            <tr key={index}>
                                <td>{item.phone_number}</td>
                                <td>{item.report}</td>
                                <td>
                                    {item.image_path.length > 0 && (
                                        <div>
                                            {item.image_path.map((imagePath, imgIndex) => (
                                                <img 
                                                    key={imgIndex} 
                                                    src={imagePath} // แสดงรูปภาพโดยตรงจาก path
                                                    alt="รูปภาพ" 
                                                    width="100" 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Result;