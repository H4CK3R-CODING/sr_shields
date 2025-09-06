import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AnnouncementDetail = () => {
  const { slug } = useParams();
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data } = await axios.get(`/api/announcements/${slug}`);
      // setAnnouncement(data);
      setAnnouncement({
        id: 1,
        title: `Announcement #${1} - Important Update`,
        url: `/announcement/${1}`,
      });
    };
    fetchAnnouncement();
  }, [slug]);

  if (!announcement) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      {/* <h1 className="text-3xl font-bold mb-4">{announcement.title}</h1> */}
      <p>hello</p>
      {/* <p className="text-gray-700 dark:text-gray-300">{announcement.content}</p> */}
    </div>
  );
};

export default AnnouncementDetail;
