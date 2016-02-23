package models

import (
	"github.com/go-xorm/xorm"
)

//////////////////////// Share_URL
func GenerateShareURLId() (int64, error) {
	return generateSequenceValue("share_url_id")
}

type ShareURL struct {
	Id       int64  `xorm:"id BIGINT PK NOT NULL" json:"id"`
	ShareURL string `xorm:"share_url VARCHAR(2048) NOT NULL" json:"share_url"`
	Fromid   string `xorm:"fromid VARCHAR(256) NOT NULL" json:"fromid"`
	Appid    string `xorm:"appid VARCHAR(256) NOT NULL" json:"appid"`

	Itemid  string `xorm:"itemid VARCHAR(256) DEFAULT NULL" json:"itemid"`
	Channel string `xorm:"channel VARCHAR(256) DEFAULT NULL" json:"channel"`
	Ver     string `xorm:"ver VARCHAR(256) DEFAULT NULL" json:"ver"`
	Des     string `xorm:"des TEXT DEFAULT NULL" json:"des"`

	Status     int `xorm:"status INT DEFAULT 0" json:"status"`
	CreatedUTC int `xorm:"created_utc INT" json:"created_utc"`
}

func (*ShareURL) TableName() string {
	return "share_url"
}

func (m *ShareURL) UniqueCond() (string, []interface{}) {
	var res = make([]interface{}, 1)
	res[0] = m.Id
	return "id=?", res
}

func GetShareURLById(s *ModelSession, Id int64) (*ShareURL, error) {
	if s == nil {
		s = newAutoCloseModelsSession()
	}
	data := &ShareURL{}
	has, err := s.Id(Id).Get(data)
	if !has || err != nil {
		return nil, err
	}
	return data, nil
}

func GetShareURLByUrl(s *ModelSession, url string) (*ShareURL, error) {
	if s == nil {
		s = newAutoCloseModelsSession()
	}

	data := &ShareURL{}
	has, err := s.Where("share_url=?", url).Get(data)
	if !has || err != nil {
		return nil, err
	}

	return data, nil
}

//////////////////////// Click_Session
func GenerateClickSessionId() (int64, error) {
	return generateSequenceValue("click_session_id")
}

type ClickSession struct {
	Id       int64  `xorm:"id BIGINT PK NOT NULL" json:"id"`
	Shareid  int64  `xorm:"shareid BIGINT NOT NULL" json:"shareid"`
	Cookieid string `xorm:"cookieid VARCHAR(256) NOT NULL" json:"cookieid"`

	Installid string `xorm:"installid VARCHAR(256) DEFAULT NULL" json:"installid"`
	Des       string `xorm:"des TEXT DEFAULT NULL" json:"des"`

	Status     int `xorm:"status INT DEFAULT 0" json:"status"`
	CreatedUTC int `xorm:"created_utc INT" json:"created_utc"`
}

func (ClickSession) TableName() string {
	return "click_session"
}

func (m *ClickSession) UniqueCond() (string, []interface{}) {
	var res = make([]interface{}, 1)
	res[0] = m.Id
	return "id=?", res
}

func GetClickSessionById(s *ModelSession, Id int64) (*ClickSession, error) {
	if s == nil {
		s = newAutoCloseModelsSession()
	}
	data := &ClickSession{}
	has, err := s.Id(Id).Get(data)
	if !has || err != nil {
		return nil, err
	}
	return data, nil
}

func GetClickSessionByCookieId(s *ModelSession, IdStr string) (*ClickSession, error) {
	if s == nil {
		s = newAutoCloseModelsSession()
	}
	data := &ClickSession{}
	has, err := s.Where("cookieid=?", IdStr).Get(data)
	if !has || err != nil {
		return nil, err
	}
	return data, nil
}

//////////////////// User Share Info
type ShareClick struct {
	ShareURL     `xorm:"extends"`
	ClickSession `xorm:"extends"`
	ScoreDesc    string `xorm:"des TEXT DEFAULT NULL" json:"des"`
}

func (ShareClick) TableName() string {
	return "share_url"
}

func GetShareClickListOfAppUser(s *ModelSession, appid string, userid string) ([]*ShareClick, error) {
	var (
		dataList = make([]*ShareClick, 0)
		err      error
	)
	if s == nil {
		s = newAutoCloseModelsSession()
	}

	var session *xorm.Session
	session = s.Join("INNER", "click_session", "share_url.id=click_session.shareid").OrderBy("click_session.created_utc desc")
	err = session.Where("appid=?", appid).And("fromid=?", userid).Find(&dataList)

	if err != nil {
		return nil, err
	}

	return dataList, nil
}